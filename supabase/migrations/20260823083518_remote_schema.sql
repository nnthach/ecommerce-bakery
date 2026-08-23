


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_cron" WITH SCHEMA "pg_catalog";






CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";






CREATE TYPE "public"."inventory_status" AS ENUM (
    'available',
    'low_stock',
    'out_of_stock',
    'draft',
    'close',
    'closed'
);


ALTER TYPE "public"."inventory_status" OWNER TO "postgres";


CREATE TYPE "public"."inventory_transaction_type" AS ENUM (
    'DAMAGE',
    'WASTE',
    'GIFT',
    'RETURN',
    'ADJUSTMENT'
);


ALTER TYPE "public"."inventory_transaction_type" OWNER TO "postgres";


CREATE TYPE "public"."order_status" AS ENUM (
    'pending',
    'confirmed',
    'preparing',
    'shipping',
    'delivered',
    'cancelled'
);


ALTER TYPE "public"."order_status" OWNER TO "postgres";


CREATE TYPE "public"."payment_method" AS ENUM (
    'payos',
    'visa'
);


ALTER TYPE "public"."payment_method" OWNER TO "postgres";


CREATE TYPE "public"."payment_status" AS ENUM (
    'unpaid',
    'paid',
    'failed',
    'refunded'
);


ALTER TYPE "public"."payment_status" OWNER TO "postgres";


CREATE TYPE "public"."store_type" AS ENUM (
    'offline',
    'online'
);


ALTER TYPE "public"."store_type" OWNER TO "postgres";


CREATE TYPE "public"."user_gender" AS ENUM (
    'male',
    'female',
    'other'
);


ALTER TYPE "public"."user_gender" OWNER TO "postgres";


CREATE TYPE "public"."user_role" AS ENUM (
    'admin',
    'staff',
    'customer'
);


ALTER TYPE "public"."user_role" OWNER TO "postgres";


CREATE TYPE "public"."user_status" AS ENUM (
    'active',
    'inactive',
    'banned'
);


ALTER TYPE "public"."user_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."clear_order_cart"("p_user_id" "uuid", "p_order_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
BEGIN

  DELETE FROM cart_items ci
  USING carts c, order_items oi
  WHERE c.id = ci.cart_id
    AND c.user_id = p_user_id
    AND oi.order_id = p_order_id
    AND ci.product_id = oi.product_id;

END;
$$;


ALTER FUNCTION "public"."clear_order_cart"("p_user_id" "uuid", "p_order_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."close_daily_menu"() RETURNS "void"
    LANGUAGE "sql"
    AS $$
UPDATE daily_inventories
SET
    status = 'closed',
    updated_at = now()
WHERE
    business_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
    AND status != 'draft';
$$;


ALTER FUNCTION "public"."close_daily_menu"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_product"("p_name_vi" "text", "p_description_vi" "text", "p_name_en" "text", "p_description_en" "text", "p_price" numeric, "p_category_id" "uuid", "p_ingredient_ids" "uuid"[], "p_image_url" "text"[]) RETURNS "uuid"
    LANGUAGE "plpgsql"
    AS $$
declare
  v_product_id uuid;
begin
  -- bước 1: tạo product
  insert into products (price, category_id, image_url, is_active)
  values (p_price, p_category_id, p_image_url, true)
  returning id into v_product_id;

  -- bước 2: tạo translation (vi + en)
  insert into product_translations (product_id, locale, name, description)
  values
    (v_product_id, 'vi', p_name_vi, p_description_vi),
    (v_product_id, 'en', p_name_en, p_description_en);

  -- bước 3: tạo product_ingredients (nếu có)
  if p_ingredient_ids is not null and array_length(p_ingredient_ids, 1) > 0 then
    insert into product_ingredients (product_id, ingredient_id)
    select v_product_id, unnest(p_ingredient_ids);
  end if;

  return v_product_id;
end;
$$;


ALTER FUNCTION "public"."create_product"("p_name_vi" "text", "p_description_vi" "text", "p_name_en" "text", "p_description_en" "text", "p_price" numeric, "p_category_id" "uuid", "p_ingredient_ids" "uuid"[], "p_image_url" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."deduct_daily_inventory"("p_store_id" "uuid", "p_product_id" "uuid", "p_business_date" "date", "p_quantity" integer) RETURNS boolean
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_remaining INTEGER;
  v_status inventory_status;
BEGIN

  -- Lock row
  SELECT remaining_quantity
  INTO v_remaining
  FROM daily_inventories
  WHERE store_id = p_store_id
    AND product_id = p_product_id
    AND business_date = p_business_date
  FOR UPDATE;

  -- Inventory không tồn tại
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  -- Không đủ tồn kho
  IF v_remaining < p_quantity THEN
    RETURN FALSE;
  END IF;

  -- Calculate status
  IF v_remaining - p_quantity = 0 THEN
    v_status := 'out_of_stock';

  ELSIF v_remaining - p_quantity <= 10 THEN
    v_status := 'low_stock';

  ELSE
    v_status := 'available';
  END IF;

  -- Update inventory
  UPDATE daily_inventories
  SET
    remaining_quantity = v_remaining - p_quantity,
    status = v_status,
    updated_at = NOW()
  WHERE store_id = p_store_id
    AND product_id = p_product_id
    AND business_date = p_business_date;

  RETURN TRUE;
END;
$$;


ALTER FUNCTION "public"."deduct_daily_inventory"("p_store_id" "uuid", "p_product_id" "uuid", "p_business_date" "date", "p_quantity" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_knowledge_chunks"("query_embedding" "extensions"."vector", "match_count" integer DEFAULT 5) RETURNS TABLE("id" "uuid", "document_id" "uuid", "chunk_index" integer, "content" "text", "metadata" "jsonb", "similarity" double precision)
    LANGUAGE "sql" STABLE
    AS $$
  select
    kc.id,
    kc.document_id,
    kc.chunk_index,
    kc.content,
    kc.metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  from knowledge_chunks kc
  join knowledge_documents kd
    on kd.id = kc.document_id
  where kd.is_active = true
  order by kc.embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_knowledge_chunks"("query_embedding" "extensions"."vector", "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."match_products"("query_embedding" "extensions"."vector", "match_count" integer DEFAULT 5) RETURNS TABLE("product_id" "uuid", "content" "text", "similarity" double precision)
    LANGUAGE "sql"
    AS $$
  select
    product_id,
    content,
    1 - (embedding <=> query_embedding) as similarity
  from product_embeddings
  order by embedding <=> query_embedding
  limit match_count;
$$;


ALTER FUNCTION "public"."match_products"("query_embedding" "extensions"."vector", "match_count" integer) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."process_successful_payment"("p_order_id" "uuid", "p_reference" "text", "p_gateway_response" "jsonb", "p_business_date" "date") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_order RECORD;
  v_item RECORD;
  v_remaining INTEGER;
  v_new_remaining INTEGER;
  v_status inventory_status;
BEGIN
  -- =========================================================
  -- 1. LOCK ORDER
  -- =========================================================
  SELECT
    id,
    user_id,
    store_id,
    payment_status
  INTO v_order
  FROM orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;

  -- =========================================================
  -- 2. IDEMPOTENCY
  -- =========================================================
  -- Webhook bị gọi lại sau khi đã xử lý
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object(
      'success', true,
      'already_processed', true,
      'order_id', v_order.id
    );
  END IF;

  -- =========================================================
  -- 3. PROCESS EACH ORDER ITEM
  -- =========================================================
  FOR v_item IN
    SELECT
      product_id,
      quantity
    FROM order_items
    WHERE order_id = v_order.id
  LOOP

    -- -------------------------------------------------------
    -- Lock inventory row
    -- -------------------------------------------------------
    SELECT remaining_quantity
    INTO v_remaining
    FROM daily_inventories
    WHERE store_id = v_order.store_id
      AND product_id = v_item.product_id
      AND business_date = p_business_date
    FOR UPDATE;

    -- Inventory không tồn tại
    IF NOT FOUND THEN
      RAISE EXCEPTION
        'Inventory not found for product: %',
        v_item.product_id;
    END IF;

    -- -------------------------------------------------------
    -- Check stock
    -- -------------------------------------------------------
    IF v_remaining < v_item.quantity THEN
      RAISE EXCEPTION
        'Insufficient inventory for product %. Available: %, Required: %',
        v_item.product_id,
        v_remaining,
        v_item.quantity;
    END IF;

    -- -------------------------------------------------------
    -- Calculate remaining
    -- -------------------------------------------------------
    v_new_remaining := v_remaining - v_item.quantity;

    -- -------------------------------------------------------
    -- Calculate status
    -- -------------------------------------------------------
    IF v_new_remaining = 0 THEN
      v_status := 'out_of_stock';
    ELSIF v_new_remaining <= 10 THEN
      v_status := 'low_stock';
    ELSE
      v_status := 'available';
    END IF;

    -- -------------------------------------------------------
    -- Update inventory
    -- -------------------------------------------------------
    UPDATE daily_inventories
    SET
      remaining_quantity = v_new_remaining,
      status = v_status,
      updated_at = NOW()
    WHERE store_id = v_order.store_id
      AND product_id = v_item.product_id
      AND business_date = p_business_date;

  END LOOP;

  -- =========================================================
  -- 4. UPDATE ORDER
  -- =========================================================
  UPDATE orders
  SET
    payment_status = 'paid',
    status = 'confirmed',
    confirmed_at = NOW(),
    updated_at = NOW()
  WHERE id = v_order.id;

  -- =========================================================
  -- 5. UPDATE PAYMENT
  -- =========================================================
  UPDATE payments
  SET
    status = 'paid',
    transaction_id = p_reference,
    gateway_response = p_gateway_response,
    updated_at = NOW()
  WHERE order_id = v_order.id;

  -- =========================================================
  -- 6. RETURN RESULT
  -- =========================================================
  RETURN jsonb_build_object(
    'success', true,
    'already_processed', false,
    'order_id', v_order.id,
    'user_id', v_order.user_id,
    'store_id', v_order.store_id
  );

END;
$$;


ALTER FUNCTION "public"."process_successful_payment"("p_order_id" "uuid", "p_reference" "text", "p_gateway_response" "jsonb", "p_business_date" "date") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."publish_daily_menu"() RETURNS "void"
    LANGUAGE "sql"
    AS $$
UPDATE daily_inventories
SET
    remaining_quantity = planned_quantity,
    status = 'available',
    updated_at = now()
WHERE
    business_date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
    AND status = 'draft';
$$;


ALTER FUNCTION "public"."publish_daily_menu"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."cart_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "cart_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "quantity" integer DEFAULT 1 NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."cart_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."carts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."carts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "jsonb" NOT NULL,
    "description" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true,
    "slug" "jsonb"
);


ALTER TABLE "public"."categories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."daily_inventories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "store_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "updated_by" "uuid" NOT NULL,
    "planned_quantity" integer DEFAULT 0,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."inventory_status" DEFAULT 'available'::"public"."inventory_status" NOT NULL,
    "remaining_quantity" integer DEFAULT 0,
    "business_date" "date"
);


ALTER TABLE "public"."daily_inventories" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ingredients" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "is_active" boolean DEFAULT true NOT NULL,
    "slug" "jsonb"
);


ALTER TABLE "public"."ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."inventory_transactions" (
    "id" bigint NOT NULL,
    "daily_inventory_id" "uuid" NOT NULL,
    "quantity" numeric,
    "type" "public"."inventory_transaction_type",
    "business_date" "date",
    "reason" "text",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."inventory_transactions" OWNER TO "postgres";


ALTER TABLE "public"."inventory_transactions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."inventory_transactions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."knowledge_chunks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "document_id" "uuid" NOT NULL,
    "chunk_index" integer NOT NULL,
    "content" "text" NOT NULL,
    "embedding" "extensions"."vector"(1536),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledge_chunks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."knowledge_documents" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "source" "text",
    "version" integer DEFAULT 1 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."knowledge_documents" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."order_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "product_name" "text" NOT NULL,
    "unit_price" numeric NOT NULL,
    "quantity" integer NOT NULL,
    "subtotal" numeric NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."order_items" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."orders" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "store_id" "uuid" NOT NULL,
    "status" "public"."order_status" DEFAULT 'pending'::"public"."order_status" NOT NULL,
    "payment_status" "public"."payment_status" DEFAULT 'unpaid'::"public"."payment_status" NOT NULL,
    "name" "text" NOT NULL,
    "phone" "text" NOT NULL,
    "address" "text" NOT NULL,
    "note" "text",
    "subtotal" numeric DEFAULT 0 NOT NULL,
    "shipping_fee" numeric DEFAULT 0 NOT NULL,
    "total" numeric DEFAULT 0 NOT NULL,
    "confirmed_at" timestamp with time zone,
    "delivered_at" timestamp with time zone,
    "cancelled_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "district" "text",
    "ward" "text",
    "city" "text",
    "payment_method" "public"."payment_method",
    "order_code" "text"
);


ALTER TABLE "public"."orders" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."payments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "order_id" "uuid" NOT NULL,
    "amount" numeric NOT NULL,
    "status" "public"."payment_status" DEFAULT 'unpaid'::"public"."payment_status" NOT NULL,
    "transaction_id" "text",
    "gateway_response" "jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone,
    "method" "public"."payment_method",
    "payment_intent_id" "text"
);


ALTER TABLE "public"."payments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_embeddings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "embedding" "extensions"."vector"(1536),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."product_embeddings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_ingredients" (
    "ingredient_id" "uuid" NOT NULL,
    "product_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."product_ingredients" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."product_translations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "product_id" "uuid" NOT NULL,
    "locale" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "slug" "text"
);


ALTER TABLE "public"."product_translations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "price" numeric,
    "category_id" "uuid",
    "image_url" "text"[],
    "is_active" boolean DEFAULT true,
    "updated_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "is_daily_bake" boolean DEFAULT false
);


ALTER TABLE "public"."products" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."staffs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "store_id" "uuid" NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "dob" "date",
    "gender" "public"."user_gender",
    "deleted_at" timestamp with time zone
);


ALTER TABLE "public"."staffs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."stores" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "address" "jsonb",
    "image_url" "text",
    "phone" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "deleted_at" timestamp with time zone,
    "city" "text",
    "district" "text",
    "slug" "text",
    "type" "public"."store_type" DEFAULT 'offline'::"public"."store_type" NOT NULL
);


ALTER TABLE "public"."stores" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "full_name" "text",
    "status" "public"."user_status" DEFAULT 'inactive'::"public"."user_status",
    "role" "public"."user_role" DEFAULT 'customer'::"public"."user_role",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone,
    "has_password" boolean DEFAULT false NOT NULL
);


ALTER TABLE "public"."users" OWNER TO "postgres";


ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_product_id_key" UNIQUE ("cart_id", "product_id");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."categories"
    ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."daily_inventories"
    ADD CONSTRAINT "daily_inventories_store_product_business_date_key" UNIQUE ("store_id", "product_id", "business_date");



ALTER TABLE ONLY "public"."ingredients"
    ADD CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_chunks"
    ADD CONSTRAINT "knowledge_chunks_document_id_chunk_index_key" UNIQUE ("document_id", "chunk_index");



ALTER TABLE ONLY "public"."knowledge_chunks"
    ADD CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."knowledge_documents"
    ADD CONSTRAINT "knowledge_documents_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_embeddings"
    ADD CONSTRAINT "product_embeddings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_embeddings"
    ADD CONSTRAINT "product_embeddings_product_id_key" UNIQUE ("product_id");



ALTER TABLE ONLY "public"."product_ingredients"
    ADD CONSTRAINT "product_ingredients_pkey" PRIMARY KEY ("ingredient_id", "product_id");



ALTER TABLE ONLY "public"."product_translations"
    ADD CONSTRAINT "product_translations_locale_slug_key" UNIQUE ("locale", "slug");



ALTER TABLE ONLY "public"."product_translations"
    ADD CONSTRAINT "product_translations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."product_translations"
    ADD CONSTRAINT "product_translations_product_id_locale_key" UNIQUE ("product_id", "locale");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staffs"
    ADD CONSTRAINT "staffs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."staffs"
    ADD CONSTRAINT "staffs_user_id_store_id_key" UNIQUE ("user_id", "store_id");



ALTER TABLE ONLY "public"."daily_inventories"
    ADD CONSTRAINT "store_inventories_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."stores"
    ADD CONSTRAINT "stores_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



CREATE INDEX "knowledge_chunks_embedding_idx" ON "public"."knowledge_chunks" USING "hnsw" ("embedding" "extensions"."vector_cosine_ops");



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_cart_id_fkey" FOREIGN KEY ("cart_id") REFERENCES "public"."carts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."cart_items"
    ADD CONSTRAINT "cart_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."carts"
    ADD CONSTRAINT "carts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."staffs"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."inventory_transactions"
    ADD CONSTRAINT "inventory_transactions_daily_inventory_id_fkey" FOREIGN KEY ("daily_inventory_id") REFERENCES "public"."daily_inventories"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."knowledge_chunks"
    ADD CONSTRAINT "knowledge_chunks_document_id_fkey" FOREIGN KEY ("document_id") REFERENCES "public"."knowledge_documents"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."order_items"
    ADD CONSTRAINT "order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."orders"
    ADD CONSTRAINT "orders_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."payments"
    ADD CONSTRAINT "payments_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_embeddings"
    ADD CONSTRAINT "product_embeddings_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_ingredients"
    ADD CONSTRAINT "product_ingredients_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "public"."ingredients"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_ingredients"
    ADD CONSTRAINT "product_ingredients_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."product_translations"
    ADD CONSTRAINT "product_translations_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON UPDATE CASCADE ON DELETE RESTRICT;



ALTER TABLE ONLY "public"."staffs"
    ADD CONSTRAINT "staffs_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."staffs"
    ADD CONSTRAINT "staffs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_inventories"
    ADD CONSTRAINT "store_inventories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_inventories"
    ADD CONSTRAINT "store_inventories_store_id_fkey" FOREIGN KEY ("store_id") REFERENCES "public"."stores"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."daily_inventories"
    ADD CONSTRAINT "store_inventories_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "public"."staffs"("id") ON DELETE SET NULL;



CREATE POLICY "Allow public read access" ON "public"."categories" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."ingredients" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."product_ingredients" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."product_translations" FOR SELECT USING (true);



CREATE POLICY "Allow public read access" ON "public"."products" FOR SELECT USING (true);



ALTER TABLE "public"."cart_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."carts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."categories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."daily_inventories" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ingredients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."inventory_transactions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_chunks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."knowledge_documents" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."order_items" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."orders" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."payments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_embeddings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_ingredients" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."product_translations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."products" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."staffs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."stores" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";








GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

































































































































































































































































































































































































































































































































GRANT ALL ON FUNCTION "public"."clear_order_cart"("p_user_id" "uuid", "p_order_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."clear_order_cart"("p_user_id" "uuid", "p_order_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."clear_order_cart"("p_user_id" "uuid", "p_order_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."close_daily_menu"() TO "anon";
GRANT ALL ON FUNCTION "public"."close_daily_menu"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."close_daily_menu"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_product"("p_name_vi" "text", "p_description_vi" "text", "p_name_en" "text", "p_description_en" "text", "p_price" numeric, "p_category_id" "uuid", "p_ingredient_ids" "uuid"[], "p_image_url" "text"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."create_product"("p_name_vi" "text", "p_description_vi" "text", "p_name_en" "text", "p_description_en" "text", "p_price" numeric, "p_category_id" "uuid", "p_ingredient_ids" "uuid"[], "p_image_url" "text"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_product"("p_name_vi" "text", "p_description_vi" "text", "p_name_en" "text", "p_description_en" "text", "p_price" numeric, "p_category_id" "uuid", "p_ingredient_ids" "uuid"[], "p_image_url" "text"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."deduct_daily_inventory"("p_store_id" "uuid", "p_product_id" "uuid", "p_business_date" "date", "p_quantity" integer) TO "anon";
GRANT ALL ON FUNCTION "public"."deduct_daily_inventory"("p_store_id" "uuid", "p_product_id" "uuid", "p_business_date" "date", "p_quantity" integer) TO "authenticated";
GRANT ALL ON FUNCTION "public"."deduct_daily_inventory"("p_store_id" "uuid", "p_product_id" "uuid", "p_business_date" "date", "p_quantity" integer) TO "service_role";









GRANT ALL ON FUNCTION "public"."process_successful_payment"("p_order_id" "uuid", "p_reference" "text", "p_gateway_response" "jsonb", "p_business_date" "date") TO "anon";
GRANT ALL ON FUNCTION "public"."process_successful_payment"("p_order_id" "uuid", "p_reference" "text", "p_gateway_response" "jsonb", "p_business_date" "date") TO "authenticated";
GRANT ALL ON FUNCTION "public"."process_successful_payment"("p_order_id" "uuid", "p_reference" "text", "p_gateway_response" "jsonb", "p_business_date" "date") TO "service_role";



GRANT ALL ON FUNCTION "public"."publish_daily_menu"() TO "anon";
GRANT ALL ON FUNCTION "public"."publish_daily_menu"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."publish_daily_menu"() TO "service_role";




































GRANT ALL ON TABLE "public"."cart_items" TO "anon";
GRANT ALL ON TABLE "public"."cart_items" TO "authenticated";
GRANT ALL ON TABLE "public"."cart_items" TO "service_role";



GRANT ALL ON TABLE "public"."carts" TO "anon";
GRANT ALL ON TABLE "public"."carts" TO "authenticated";
GRANT ALL ON TABLE "public"."carts" TO "service_role";



GRANT ALL ON TABLE "public"."categories" TO "anon";
GRANT ALL ON TABLE "public"."categories" TO "authenticated";
GRANT ALL ON TABLE "public"."categories" TO "service_role";



GRANT ALL ON TABLE "public"."daily_inventories" TO "anon";
GRANT ALL ON TABLE "public"."daily_inventories" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_inventories" TO "service_role";



GRANT ALL ON TABLE "public"."ingredients" TO "anon";
GRANT ALL ON TABLE "public"."ingredients" TO "authenticated";
GRANT ALL ON TABLE "public"."ingredients" TO "service_role";



GRANT ALL ON TABLE "public"."inventory_transactions" TO "anon";
GRANT ALL ON TABLE "public"."inventory_transactions" TO "authenticated";
GRANT ALL ON TABLE "public"."inventory_transactions" TO "service_role";



GRANT ALL ON SEQUENCE "public"."inventory_transactions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."inventory_transactions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."inventory_transactions_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_chunks" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_chunks" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_chunks" TO "service_role";



GRANT ALL ON TABLE "public"."knowledge_documents" TO "anon";
GRANT ALL ON TABLE "public"."knowledge_documents" TO "authenticated";
GRANT ALL ON TABLE "public"."knowledge_documents" TO "service_role";



GRANT ALL ON TABLE "public"."order_items" TO "anon";
GRANT ALL ON TABLE "public"."order_items" TO "authenticated";
GRANT ALL ON TABLE "public"."order_items" TO "service_role";



GRANT ALL ON TABLE "public"."orders" TO "anon";
GRANT ALL ON TABLE "public"."orders" TO "authenticated";
GRANT ALL ON TABLE "public"."orders" TO "service_role";



GRANT ALL ON TABLE "public"."payments" TO "anon";
GRANT ALL ON TABLE "public"."payments" TO "authenticated";
GRANT ALL ON TABLE "public"."payments" TO "service_role";



GRANT ALL ON TABLE "public"."product_embeddings" TO "anon";
GRANT ALL ON TABLE "public"."product_embeddings" TO "authenticated";
GRANT ALL ON TABLE "public"."product_embeddings" TO "service_role";



GRANT ALL ON TABLE "public"."product_ingredients" TO "anon";
GRANT ALL ON TABLE "public"."product_ingredients" TO "authenticated";
GRANT ALL ON TABLE "public"."product_ingredients" TO "service_role";



GRANT ALL ON TABLE "public"."product_translations" TO "anon";
GRANT ALL ON TABLE "public"."product_translations" TO "authenticated";
GRANT ALL ON TABLE "public"."product_translations" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."staffs" TO "anon";
GRANT ALL ON TABLE "public"."staffs" TO "authenticated";
GRANT ALL ON TABLE "public"."staffs" TO "service_role";



GRANT ALL ON TABLE "public"."stores" TO "anon";
GRANT ALL ON TABLE "public"."stores" TO "authenticated";
GRANT ALL ON TABLE "public"."stores" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































