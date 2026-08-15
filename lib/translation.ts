export const translations = {
  en: {
    // Navbar header
    headerNav: {
      ourStory: "Our Story",
      menu: "Menu",
      bakedDaily: "Baked Daily",
    },
    headerButton: {
      orderNow: "Order Now",
      signin: "Sign In",
    },
    headerDropdown: {
      dashboard: "Dashboard",
      profile: "Profile",
      signOut: "Sign Out",
    },
    cart: {
      iconLabel: "Cart",
      title: "Your Cart",
      empty: "Your cart is empty",
      loading: "Loading cart...",
      signInRequired: "Sign in to view your cart",
      subtotal: "Subtotal",
      checkout: "Checkout",
    },
    // auth pages
    authPage: {
      signinPage: {
        badge: "Welcome Back",
        title: "Sign In to Your Account",
        subtitle: "Enter your details to continue.",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "Enter your password",
        submit: "Sign In",
        noAccount: "Don't have an account?",
        signUpLink: "Sign Up",
        errors: {
          emailRequired: "Email is required.",
          emailInvalid: "Invalid email address.",
          passwordRequired: "Password is required.",
          generic: "Something went wrong. Please try again.",
        },
      },
      signupPage: {
        badge: "Join Us",
        title: "Create Your Account",
        subtitle: "Enter your details to get started.",
        fullNameLabel: "Full Name",
        fullNamePlaceholder: "John Doe",
        emailLabel: "Email",
        emailPlaceholder: "you@example.com",
        passwordLabel: "Password",
        passwordPlaceholder: "At least 6 characters",
        submit: "Sign Up",
        haveAccount: "Already have an account?",
        signInLink: "Sign In",
        successTitle: "Check Your Email",
        successMessage:
          "We've sent a verification link to your email. Please verify your account before signing in.",
        backToSignIn: "Back to Sign In",
        errors: {
          fullNameRequired: "Full name is required.",
          emailRequired: "Email is required.",
          emailInvalid: "Invalid email address.",
          passwordRequired: "Password is required.",
          passwordTooShort: "Password must be at least 6 characters.",
          generic: "Something went wrong. Please try again.",
        },
      },
      registerPasswordPage: {
        badge: "Almost There",
        title: "Set Your Password",
        subtitle: "Create a password to secure your account.",
        passwordLabel: "Password",
        passwordPlaceholder: "At least 6 characters",
        submit: "Save Password",
        errors: {
          passwordRequired: "Password is required.",
          passwordTooShort: "Password must be at least 6 characters.",
          generic: "Something went wrong. Please try again.",
        },
      },
    },
    // home page
    homePage: {
      heroSection: {
        badge: "Freshly Baked",
        title: "Pure Ingredients,\nPerfect Every Bite",
        description:
          "Handcrafted every morning with quality flour, slow fermentation, and no shortcuts — bread the way it's meant to be.",
      },
      standardSection: {
        badge: "Our Promise",
        title: "Baked On Three Simple Promises",
        description:
          "Whether it's our first batch of the day or our last, every loaf that leaves our oven follows the same three standards.",
        principles: {
          natural: {
            title: "100% Natural",
            description:
              "Real flour, real butter — no preservatives, no shortcuts.",
          },
          handcraftedDaily: {
            title: "Handcrafted Daily",
            description:
              "Every loaf is shaped and kneaded by hand, never machine-pressed.",
          },
          alwaysFresh: {
            title: "Always Fresh",
            description:
              "Nothing sits overnight — out of the oven every morning.",
          },
        },
      },
      storySection: {
        badge: "Our Story",
        title: "Every loaf carries a little piece of our heart",
        description:
          "We believe a loaf isn't finished when it leaves the oven —it's finished when someone breaks it open at their table. That's why every batch, big or small, gets the same care, the same patience, and the same hands.\n\nWhether we're baking one loaf or one hundred, every batch receives the same care and attention. To us, bread is more than food—it's a way to bring people together, creating moments of warmth, comfort, and connection around the table.\n\nFrom our hands to yours, every loaf is baked with passion, crafted with tradition, and made to be shared.",
      },
      bestSellerSection: {
        badge: "Baked Daily",
        title: "Customer Favorites, Baked Fresh",
        description: "Handcrafted favorites, loved by generations.",
      },
      whyChooseSection: {
        title: "Why people return every morning",
        reasons: {
          freshDaily: {
            title: "Fresh Daily",
            description:
              "Every pastry is baked before sunrise, ensuring you experience the warmth of fresh-from-the-oven goodness.",
          },
          organicIngredients: {
            title: "Organic Ingredients",
            description:
              "We source only the finest organic flours, European butter, and seasonal ingredients from local farms.",
          },
          slowFermented: {
            title: "Slow Fermented",
            description:
              "Our breads are fermented for 48–72 hours, developing deep flavors and perfect texture naturally.",
          },
          handmadeProcess: {
            title: "Handmade Process",
            description:
              "Every loaf is shaped by hand, every croissant folded with care—no machines, just craftsmanship.",
          },
        },
      },
      ctaSection: {
        badge: "From Our Hearts To Your Table",
        titleOne: "Baked With Passion,",
        titleTwo: "Shared With Love.",
        description:
          "At Petit Bakery, every loaf and pastry carries the care of real hands and honest ingredients — because you deserve nothing less.",
      },
    },
    // menu page
    menuPage: {
      heroSection: {
        badge: "Our Menu",
        title: "Everything We Bake, \nIn One Place",
        description:
          "From crusty loaves to delicate cakes — explore our full selection, baked fresh every single day.",
      },
      menuFilter: {
        all: "All",
        bread: "Bread",
        cake: "Cake",
        pastry: "Pastry",
        empty: "No items found in this category.",
      },
      pagination: {
        previous: "Previous",
        next: "Next",
      },
      productStatus: {
        available: "Available",
        low_stock: "Low Stock",
        out_of_stock: "Out of Stock",
        draft: "Draft",
      },
    },
    // product detail
    productDetailPage: {
      ingredients: "Ingredients",
      youMightAlsoLike: "You Might Also Like",
      ingredientsList: {
        wheatFlour: "Wheat flour",
        freshMilk: "Fresh milk",
        butter: "Butter",
        sweetCream: "Sweet cream",
        yeast: "Yeast",
        creamCheese: "Cream cheese",
        milk: "Milk",
        sugar: "Sugar",
        raisins: "Raisins",
        honey: "Honey",
        frankfurterSausage: "Frankfurter sausage",
        onion: "Onion",
        ketchup: "Ketchup",
        purpleSweetPotato: "Purple sweet potato",
        redBeanPaste: "Red bean paste",
        matchaPowder: "Matcha powder",
        spongeCake: "Sponge cake",
        freshCream: "Fresh cream",
        eggs: "Eggs",
        freshStrawberries: "Fresh strawberries",
        whippedCream: "Whipped cream",
        cornStarch: "Corn starch",
        strawberries: "Strawberries",
        blueberries: "Blueberries",
        raspberries: "Raspberries",
        almondCream: "Almond cream",
        slicedAlmonds: "Sliced almonds",
        darkChocolate: "Dark chocolate",
        cocoa: "Cocoa",
        salt: "Salt",
        garlicButter: "Garlic butter",
        mozzarellaCheese: "Mozzarella cheese",
        parsley: "Parsley",
      },
    },
    // button
    button: {
      orderNow: "Order Now",
      addToCart: "Add to Cart",
      exploreMenu: "Explore Menu",
      visitOurBakery: "Visit Our Bakery",
      viewDetail: "View Detail",
      backToMenu: "Back To Menu",
      filter: "Filter",
      apply: "Apply",
      clearFilter: "Clear filter",
      signin: "Sign In",
    },

    // footer
    footer: {
      brand: {
        description:
          "Petit Bakery bakes with honest ingredients and real care, so every visit feels a little like coming home.",
      },
      menu: {
        title: "Our Menu",
        links: {
          bestsellers: "Bestsellers",
          standards: "Our Standards",
          whyChoose: "Why Choose Us",
        },
      },
      about: {
        title: "About Us",
        links: {
          ourStory: "Our Story",
          ourBakery: "Our Bakery",
          getInTouch: "Get In Touch",
        },
      },
      visit: {
        title: "Visit Us",
        address: "123 Nguyen Hue Street, District 1, Ho Chi Minh City",
        phone: "0123 456 789",
        email: "hello@petitbakery.com",
        hours: "Open Daily: 6:00 AM – 8:00 PM",
      },
      copyright: "© 2026 Petit Bakery. Baked with love, every day.",
    },

    // order page
    orderPage: {
      signInRequired: {
        title: "Sign in to place an order",
        message: "Please sign in so we can prepare your order.",
      },
      info: {
        title: "Delivery Information",
        fullName: "Recipient Name",
        fullNamePlaceholder: "John Doe",
        phone: "Phone Number",
        phonePlaceholder: "090 123 4567",
        city: "Province / City",
        cityPlaceholder: "-- Select province / city --",
        district: "District",
        districtPlaceholder: "-- Select district --",
        selectCityFirst: "Please select a province / city first",
        ward: "Ward",
        wardPlaceholder: "-- Select ward --",
        selectDistrictFirst: "Please select a district first",
        loading: "Loading...",
        address: "Address Detail",
        addressPlaceholder: "House number, street name...",
        note: "Note",
        notePlaceholder: "e.g. Call before delivery, leave at front desk...",
      },
      payment: {
        title: "Payment Method",
        visa: {
          title: "Pay with Card",
          description: "Visa, Mastercard and other debit/credit cards",
        },
        payos: {
          title: "Pay with PayOS",
          description: "Scan the QR code for a fast, secure payment",
          comingSoon: "PayOS QR payment is coming soon.",
        },
      },
      summary: {
        title: "Your Order",
        itemCount: "{count} items",
        empty: "Your cart is empty",
        browseMenu: "Browse Menu",
        subtotal: "Subtotal",
        shippingFee: "Shipping Fee",
        free: "Free",
        total: "Total",
        placeOrder: "Pay Now",
        scanToPay: "Scan the QR code to pay with PayOS",
        paymentSuccess: "Payment successful",
        disclaimer:
          "This is a UI preview only — your order has not been submitted.",
      },
      errors: {
        fullNameRequired: "Recipient name is required.",
        phoneRequired: "Phone number is required.",
        phoneInvalid: "Please enter a valid phone number.",
        cityRequired: "Please enter your province / city.",
        districtRequired: "Please enter your district.",
        wardRequired: "Please enter your ward.",
        addressRequired: "Please enter your address detail.",
      },
      result: {
        success: {
          title: "Payment successful",
          message: "Your order has been placed and payment confirmed.",
        },
        fail: {
          title: "Payment failed",
          message:
            "We couldn't process your payment. Please try again or use a different card.",
        },
        backToMenu: "Browse Menu",
        tryAgain: "Try Again",
        orderNumber: "Order #{id}",
        loading: "Loading order details...",
        items: "Items",
        deliveryInfo: "Delivery Information",
        store: "Store",
      },
      toastSuccess: "Order placed!",
      toastError: "Failed to place order. Please try again.",
    },

    // admin
    admin: {
      headerBreadcrumb: {
        dashboard: "Dashboard",
        categories: "Categories",
        ingredients: "Ingredients",
        orders: "Orders",
        products: "Products",
        reviews: "Reviews",
        customers: "Customers",
        settings: "Settings",
        staffs: "Staffs",
        stores: "Stores",
        storeInventories: "Store Inventory",
      },
      headerDropdown: {
        notifications: "Notifications",
        account: "Account",
        profile: "Profile",
        accountSettings: "Account Settings",
        signOut: "Sign Out",
      },
      // sidebar
      sidebar: {
        groups: {
          management: "Management",
          storeManagement: "Store Management",
          products: "Products",
          system: "System",
        },
        nav: {
          dashboard: "Dashboard",
          staffs: "Staffs",
          orders: "Orders",
          products: "Products",
          categories: "Categories",
          ingredients: "Ingredients",
          reviews: "Reviews",
          customers: "Customers",
          settings: "Settings",
          stores: "Stores",
          storeInventories: "Store Inventory",
        },
        user: {
          profile: "Profile",
          account: "Account",
          signOut: "Sign Out",
        },
      },
      // dashboard page
      dashboardPage: {
        headerTitle: {
          title: "Dashboard",
          subtitle: "Overview of Petit Bakery's activity",
        },
      },
      // shared table
      table: {
        columns: {
          no: "#",
          status: "Status",
          createdAt: "Created At",
          actions: "Actions",
        },
        pagination: {
          showing: "Showing",
          of: "of",
          previous: "Previous",
          next: "Next",
        },
      },
      // shared modal strings
      modal: {
        cancel: "Cancel",
        saveChanges: "Save Changes",
        loading: "Loading...",
        image: "Image",
        pickImage: "Pick image",
        descriptionVi: "Description (VI)",
        descriptionEn: "Description (EN)",
      },
      productsPage: {
        headerTitle: {
          title: "Products",
          subtitle: "Manage your product catalog",
        },
        table: {
          columns: {
            image: "Image",
            name: "Product Name",
            price: "Price",
            category: "Category",
          },
        },
        createModal: {
          trigger: "Create Product",
          title: "New Product",
          submit: "Create Product",
          fields: {
            nameVi: "Name (VI)",
            nameEn: "Name (EN)",
            price: "Price (VND)",
            descriptionVi: "Description (VI)",
            descriptionEn: "Description (EN)",
            category: "Category",
            categoryPlaceholder: "-- Select category --",
            ingredients: "Ingredients",
            noIngredients: "No ingredients.",
          },
          errors: {
            nameViRequired: "Vietnamese name is required.",
            priceRequired: "Price must be greater than 0.",
            categoryRequired: "Please select a category.",
          },
        },
        updateModal: {
          title: "Edit Product",
          submit: "Save Changes",
          fields: {
            nameVi: "Name (VI)",
            nameEn: "Name (EN)",
            price: "Price (VND)",
            descriptionVi: "Description (VI)",
            descriptionEn: "Description (EN)",
            category: "Category",
            categoryPlaceholder: "-- Select category --",
            ingredients: "Ingredients",
            noIngredients: "No ingredients.",
          },
          errors: {
            nameViRequired: "Vietnamese name is required.",
            priceRequired: "Price must be greater than 0.",
            categoryRequired: "Please select a category.",
          },
        },
      },
      categoriesPage: {
        headerTitle: {
          title: "Categories",
          subtitle: "Manage product categories",
        },
        table: {
          columns: {
            name: "Category Name",
            description: "Description",
          },
        },
        createModal: {
          trigger: "Create Category",
          title: "New Category",
          submit: "Create Category",
          fields: {
            nameVi: "Category Name (VI)",
            nameEn: "Category Name (EN)",
            descriptionVi: "Description (VI)",
            descriptionEn: "Description (EN)",
          },
          errors: {
            nameViRequired: "Category name (VI) is required.",
            nameEnRequired: "Category name (EN) is required.",
          },
        },
        updateModal: {
          title: "Edit Category",
          submit: "Save Changes",
          fields: {
            nameVi: "Category Name (VI)",
            nameEn: "Category Name (EN)",
            descriptionVi: "Description (VI)",
            descriptionEn: "Description (EN)",
          },
          errors: {
            nameViRequired: "Category name (VI) is required.",
            nameEnRequired: "Category name (EN) is required.",
          },
        },
      },
      ingredientsPage: {
        headerTitle: {
          title: "Ingredients",
          subtitle: "Manage product ingredients",
        },
        table: {
          columns: {
            name: "Ingredient Name",
          },
        },
        createModal: {
          trigger: "Create Ingredient",
          title: "New Ingredient",
          submit: "Create Ingredient",
          fields: {
            nameVi: "Ingredient Name (VI)",
            nameEn: "Ingredient Name (EN)",
          },
          errors: {
            nameViRequired: "Ingredient name (VI) is required.",
            nameEnRequired: "Ingredient name (EN) is required.",
          },
        },
        updateModal: {
          title: "Edit Ingredient",
          submit: "Save Changes",
          fields: {
            nameVi: "Ingredient Name (VI)",
            nameEn: "Ingredient Name (EN)",
          },
          errors: {
            nameViRequired: "Ingredient name (VI) is required.",
            nameEnRequired: "Ingredient name (EN) is required.",
          },
        },
      },
      storesPage: {
        headerTitle: {
          title: "Stores",
          subtitle: "Manage stores",
        },
        table: {
          columns: {
            name: "Store Name",
            address: "Address",
            phone: "Phone",
            image: "Image",
            type: "Type",
          },
        },
        createModal: {
          trigger: "Create Store",
          title: "New Store",
          submit: "Create Store",
          fields: {
            name: "Store Name",
            addressVi: "Address (VI)",
            addressEn: "Address (EN)",
            city: "City",
            district: "District",
            phone: "Phone",
            type: "Type",
          },
          errors: {
            nameRequired: "Store name is required.",
            addressViRequired: "Address (VI) is required.",
            addressEnRequired: "Address (EN) is required.",
            typeRequired: "Type is required.",
          },
        },
        updateModal: {
          title: "Edit Store",
          submit: "Save Changes",
          fields: {
            name: "Store Name",
            addressVi: "Address (VI)",
            addressEn: "Address (EN)",
            city: "City",
            district: "District",
            phone: "Phone",
            type: "Type",
            status: "Status",
            statusActive: "Active",
            statusInactive: "Inactive",
          },
          errors: {
            nameRequired: "Store name is required.",
            addressViRequired: "Address (VI) is required.",
            addressEnRequired: "Address (EN) is required.",
            typeRequired: "Type is required.",
          },
        },
      },
      storeInventoriesPage: {
        headerTitle: {
          title: "Store Inventory",
          subtitle: "Manage product stock levels for your store",
        },
        table: {
          columns: {
            image: "Image",
            name: "Product Name",
            plannedQuantity: "Planned Quantity",
            remainQuantity: "Remain Quantity",
            updatedBy: "Updated By",
            status: "Status",
            businessDate: "Business Date",
          },
        },
        status: {
          available: "Available",
          out_of_stock: "Out of Stock",
          low_stock: "Low Stock",
          draft: "Draft",
          unknown: "Unknown",
        },
        storeSelect: {
          loading: "Loading stores...",
          empty: "No stores available",
        },
        empty: "No inventory items found",
        showing: "Showing",
        item: "items",
      },
      staffsPage: {
        headerTitle: {
          title: "Staff Management",
          subtitle: "System staff list",
        },
        table: {
          columns: {
            fullname: "Full Name",
            email: "Email",
            store: "Store",
            dob: "Date of Birth",
            gender: "Gender",
          },
        },
        filter: {
          statusLabel: "Status",
          sortByLabel: "Sort By",
          orderLabel: "Order",
          statusOptions: {
            all: "All",
            active: "Active",
            inactive: "Inactive",
          },
          sortByOptions: {
            createdAt: "Created At",
            fullname: "Full Name",
          },
          orderOptions: {
            desc: "Descending",
            asc: "Ascending",
          },
        },
        gender: {
          male: "Male",
          female: "Female",
          other: "Other",
        },
        status: {
          active: "Active",
          inactive: "Inactive",
          disabled: "Disabled",
        },
        empty: "No staff found",
        showing: "Showing",
        staff: "staff",
        searchPlaceholder: "Search name or email...",
        clearSearch: "Clear search",
        deleteConfirm: "Are you sure you want to delete this staff member?",
        createModal: {
          trigger: "Add Staff",
          title: "Add New Staff",
          submit: "Add New",
          fields: {
            fullname: "Full Name",
            email: "Email",
            dob: "Date of Birth",
            gender: "Gender",
            fullnamePlaceholder: "E.g.: John Doe",
            store: "Store",
            storePlaceholder: "Select a store",
            storeLoading: "Loading stores...",
          },
          genderOptions: {
            male: "Male",
            female: "Female",
            other: "Other",
          },
          errors: {
            fullnameRequired: "Full name is required.",
            emailRequired: "Email is required.",
            emailInvalid: "Invalid email address.",
            dobRequired: "Date of birth is required.",
            storeRequired: "Store is required.",
          },
        },
        updateModal: {
          title: "Update Staff",
          submit: "Save Changes",
          fields: {
            fullname: "Full Name",
            email: "Email",
            dob: "Date of Birth",
            gender: "Gender",
            fullnamePlaceholder: "E.g.: John Doe",
            store: "Store",
            storePlaceholder: "Select a store",
            storeLoading: "Loading stores...",
          },
          genderOptions: {
            male: "Male",
            female: "Female",
            other: "Other",
          },
          errors: {
            fullnameRequired: "Full name is required.",
            emailRequired: "Email is required.",
            emailInvalid: "Invalid email address.",
            dobRequired: "Date of birth is required.",
            storeRequired: "Store is required.",
          },
        },
      },
      orderPage: {
        headerTitle: {
          title: "Orders",
          subtitle: "Manage orders",
        },
        filter: {
          statusLabel: "Status",
          sortByLabel: "Sort By",
          orderLabel: "Order",
          statusOptions: {
            all: "All",
            active: "Active",
            inactive: "Inactive",
          },
          sortByOptions: {
            createdAt: "Created At",
            fullname: "Full Name",
          },
          orderOptions: {
            desc: "Descending",
            asc: "Ascending",
          },
        },
        status: {
          order: {
            pending: "Pending",
            confirmed: "Confirmed",
            preparing: "Preparing",
            shipping: "Shipping",
            delivered: "Delivered",
            cancelled: "Cancelled",
          },
          payment: {
            unpaid: "Unpaid",
            paid: "Paid",
            failed: "Failed",
            refunded: "Refunded",
          },
        },
        searchPlaceholder: "Search by customer or order code...",
        showing: "Showing",
        order: "order",
        table: {
          columns: {
            customer: "Customer",
            orderCode: "Order Code",
            store: "Store",
            orderStatus: "Order Status",
            paymentStatus: "Payment Status",
            total: "Total",
            paymentMethod: "Payment Method",
            createdAt: "Created At",
          },
        },
      },
    },

    // staff
    staff: {
      headerBreadcrumb: {
        dashboard: "Dashboard",
        orders: "Orders",
        reviews: "Reviews",
        staffs: "Staffs",
        storeInventories: "Store Inventory",
      },
      headerDropdown: {
        profile: "Profile",
        accountSettings: "Account Settings",
        signOut: "Sign Out",
      },
      // sidebar
      sidebar: {
        groups: {
          management: "Management",
        },
        nav: {
          dashboard: "Dashboard",
          staffs: "Staffs",
          orders: "Orders",
          reviews: "Reviews",
          customers: "Customers",
          storeInventories: "Store Inventory",
        },
        user: {
          profile: "Profile",
          account: "Account",
          signOut: "Sign Out",
        },
      },
      // dashboard page
      dashboardPage: {
        headerTitle: {
          title: "Dashboard",
          subtitle: "Overview of the store's activity",
        },
      },
      modal: {
        cancel: "Cancel",
      },
      storeInventoriesPage: {
        createModal: {
          trigger: "Add Products",
          title: "Add Products to Inventory",
          submit: "Add to Inventory",
          addRow: "Add Product",
          fields: {
            product: "Product",
            quantity: "Quantity",
          },
          productSelect: {
            placeholder: "Select a product",
            loading: "Loading products...",
            empty: "No active products available",
          },
          errors: {
            productRequired: "Please select a product.",
            duplicateProduct: "This product has already been added.",
            quantityInvalid: "Quantity must be 0 or greater.",
            fetchProductsFailed: "Failed to load products.",
            submitFailed: "Failed to add products to inventory.",
          },
        },
      },
    },
  },
  vi: {
    // Navbar header
    headerNav: {
      ourStory: "Câu truyện",
      menu: "Thực đơn",
      bakedDaily: "Bánh mỗi ngày",
    },
    headerButton: {
      orderNow: "Đặt hàng",
      signin: "Đăng nhập",
    },
    headerDropdown: {
      dashboard: "Trang quản lý",
      profile: "Hồ sơ",
      signOut: "Đăng xuất",
    },
    cart: {
      iconLabel: "Giỏ hàng",
      title: "Giỏ hàng",
      empty: "Giỏ hàng của bạn đang trống",
      loading: "Đang tải giỏ hàng...",
      signInRequired: "Đăng nhập để xem giỏ hàng",
      subtotal: "Tạm tính",
      checkout: "Thanh toán",
    },
    // auth pages
    authPage: {
      signinPage: {
        badge: "Chào mừng trở lại",
        title: "Đăng nhập tài khoản",
        subtitle: "Nhập thông tin của bạn để tiếp tục.",
        emailLabel: "Email",
        emailPlaceholder: "email@vidu.com",
        passwordLabel: "Mật khẩu",
        passwordPlaceholder: "Nhập mật khẩu",
        submit: "Đăng nhập",
        noAccount: "Chưa có tài khoản?",
        signUpLink: "Đăng ký",
        errors: {
          emailRequired: "Vui lòng nhập email.",
          emailInvalid: "Email không hợp lệ.",
          passwordRequired: "Vui lòng nhập mật khẩu.",
          generic: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        },
      },
      signupPage: {
        badge: "Tham gia cùng chúng tôi",
        title: "Tạo tài khoản mới",
        subtitle: "Nhập thông tin của bạn để bắt đầu.",
        fullNameLabel: "Họ và tên",
        fullNamePlaceholder: "Nguyễn Văn A",
        emailLabel: "Email",
        emailPlaceholder: "email@vidu.com",
        passwordLabel: "Mật khẩu",
        passwordPlaceholder: "Ít nhất 6 ký tự",
        submit: "Đăng ký",
        haveAccount: "Đã có tài khoản?",
        signInLink: "Đăng nhập",
        successTitle: "Kiểm tra email của bạn",
        successMessage:
          "Chúng tôi đã gửi một liên kết xác thực đến email của bạn. Vui lòng xác thực tài khoản trước khi đăng nhập.",
        backToSignIn: "Quay lại đăng nhập",
        errors: {
          fullNameRequired: "Vui lòng nhập họ và tên.",
          emailRequired: "Vui lòng nhập email.",
          emailInvalid: "Email không hợp lệ.",
          passwordRequired: "Vui lòng nhập mật khẩu.",
          passwordTooShort: "Mật khẩu phải có ít nhất 6 ký tự.",
          generic: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        },
      },
      registerPasswordPage: {
        badge: "Gần Xong Rồi",
        title: "Thiết Lập Mật Khẩu",
        subtitle: "Tạo mật khẩu để bảo vệ tài khoản của bạn.",
        passwordLabel: "Mật khẩu",
        passwordPlaceholder: "Ít nhất 6 ký tự",
        submit: "Lưu mật khẩu",
        errors: {
          passwordRequired: "Vui lòng nhập mật khẩu.",
          passwordTooShort: "Mật khẩu phải có ít nhất 6 ký tự.",
          generic: "Đã có lỗi xảy ra. Vui lòng thử lại.",
        },
      },
    },
    // home page
    homePage: {
      heroSection: {
        badge: "Bánh Mì Tươi Mỗi Ngày",
        title: "Nguyên Liệu Tinh Khiết,\nHoàn Hảo Trong Từng Miếng Bánh",
        description:
          "Được làm thủ công mỗi sáng từ bột mì hảo hạng, lên men chậm và không cắt giảm bất kỳ công đoạn nào — bánh mì đúng như vốn dĩ phải thế.",
      },
      standardSection: {
        badge: "Cam Kết Của Chúng Tôi",
        title: "Ba Tiêu Chuẩn Vàng Trong Từng Mẻ Bánh",
        description:
          "Dù là mẻ bánh đầu tiên hay mẻ cuối cùng trong ngày, mỗi chiếc bánh ra lò đều giữ vững ba tiêu chuẩn không đổi.",
        principles: {
          natural: {
            title: "100% Tự Nhiên",
            description:
              "Bột mì nguyên chất, bơ hảo hạng — không chất bảo quản, không cắt giảm quy trình.",
          },
          handcraftedDaily: {
            title: "Làm Thủ Công Mỗi Ngày",
            description:
              "Mỗi ổ bánh đều được nhào nặn bằng tay bởi những người thợ làm bánh giàu kinh nghiệm, không sử dụng máy ép công nghiệp.",
          },
          alwaysFresh: {
            title: "Luôn Tươi Mới",
            description:
              "Bánh được nướng mới mỗi sáng, không lưu qua đêm để giữ trọn hương vị và độ tươi ngon.",
          },
        },
      },
      storySection: {
        badge: "Câu Chuyện Của Chúng Tôi",
        title: "Mỗi chiếc bánh là một phần trái tim",
        description:
          "Với chúng tôi, một chiếc bánh chưa thực sự hoàn thành khi vừa ra lò, nó chỉ thật sự hoàn thành khi ai đó bẻ bánh ra trên bàn ăn của họ. Đó là lý do mỗi mẻ bánh, dù lớn hay nhỏ, đều nhận được sự chăm chút, kiên nhẫn và đôi tay tận tâm như nhau.\n\nDù làm một chiếc bánh hay một trăm chiếc, mỗi mẻ đều được chăm sóc kỹ lưỡng như nhau. Với chúng tôi, bánh mì không chỉ là thức ăn, đó là cách để mọi người xích lại gần nhau, cùng tạo nên những khoảnh khắc ấm áp, thân thuộc và gắn kết quanh bàn ăn.\n\nTừ tay chúng tôi đến tay bạn, mỗi chiếc bánh được làm bằng đam mê, giữ trọn nét truyền thống và luôn sẵn sàng để sẻ chia.",
      },
      bestSellerSection: {
        badge: "Bánh Mỗi Ngày",
        title: "Món Được Yêu Thích, Bánh Tươi Mỗi Ngày",
        description: "Hương vị thủ công, được bao thế hệ tin yêu.",
      },
      whyChooseSection: {
        title: "Niềm tin từ khách hàng",
        reasons: {
          freshDaily: {
            title: "Tươi Mới Mỗi Ngày",
            description:
              "Mỗi món bánh được nướng trước khi trời sáng, để bạn luôn cảm nhận được hơi ấm ngọt ngào ngay khi vừa ra lò.",
          },
          organicIngredients: {
            title: "Nguyên Liệu Hữu Cơ",
            description:
              "Chúng tôi chỉ chọn loại bột hữu cơ thượng hạng, bơ nhập từ châu Âu và nguyên liệu theo mùa từ nông trại địa phương.",
          },
          slowFermented: {
            title: "Lên Men Tự Nhiên",
            description:
              "Bánh mì được lên men từ 48–72 giờ, tạo nên hương vị đậm đà và kết cấu hoàn hảo một cách tự nhiên.",
          },
          handmadeProcess: {
            title: "Tỉ Mỉ Từng Công Đoạn",
            description:
              "Từng chiếc bánh được tạo hình bằng tay, từng lớp croissant được gấp thật khéo — không máy móc, chỉ có tay nghề thật.",
          },
        },
      },
      ctaSection: {
        badge: "Từ Trái Tim Đến Từng Chiếc Bánh",
        titleOne: "Làm Bằng Đam Mê,",
        titleTwo: "Trao Đi Bằng Yêu Thương.",
        description:
          "Tại Petit Bakery, mỗi chiếc bánh mì và bánh ngọt đều chứa đựng sự chăm chút từ đôi tay thật và nguyên liệu chân thật — vì bạn xứng đáng nhận được điều tốt nhất.",
      },
    },

    // menu page
    menuPage: {
      heroSection: {
        badge: "Thực Đơn",
        title: "Khám Phá Hương Vị\nTrong Từng Chiếc Bánh",
        description:
          "Từ bánh mì thủ công, bánh ngọt đến những chiếc bánh kem tinh tế — tất cả đều được nướng mới mỗi ngày từ những nguyên liệu tuyển chọn.",
      },
      menuFilter: {
        all: "Tất cả",
        bread: "Bánh mì",
        cake: "Bánh kem",
        pastry: "Bánh ngọt",
        empty: "Không có sản phẩm nào trong danh mục này.",
      },
      pagination: {
        previous: "Trước",
        next: "Sau",
      },
      productStatus: {
        available: "Còn hàng",
        low_stock: "Sắp hết hàng",
        out_of_stock: "Hết hàng",
      },
    },

    // product detail
    productDetailPage: {
      ingredients: "Nguyên liệu",
      youMightAlsoLike: "Có thể bạn sẽ thích",
      ingredientsList: {
        wheatFlour: "Bột mì",
        freshMilk: "Sữa tươi",
        butter: "Bơ",
        sweetCream: "Kem ngọt",
        yeast: "Men nở",
        creamCheese: "Phô mai kem",
        milk: "Sữa",
        sugar: "Đường",
        raisins: "Nho khô",
        honey: "Mật ong",
        frankfurterSausage: "Xúc xích Frankfurter",
        onion: "Hành tây",
        ketchup: "Tương cà",
        purpleSweetPotato: "Khoai lang tím",
        redBeanPaste: "Đậu đỏ",
        matchaPowder: "Bột trà xanh",
        spongeCake: "Cốt bánh bông lan",
        freshCream: "Kem tươi",
        eggs: "Trứng",
        freshStrawberries: "Dâu tây tươi",
        whippedCream: "Kem tươi đánh bông",
        cornStarch: "Bột bắp",
        strawberries: "Dâu tây",
        blueberries: "Việt quất",
        raspberries: "Mâm xôi",
        almondCream: "Kem hạnh nhân",
        slicedAlmonds: "Hạnh nhân lát",
        darkChocolate: "Socola đen",
        cocoa: "Bột cacao",
        salt: "Muối",
        garlicButter: "Bơ tỏi",
        mozzarellaCheese: "Phô mai Mozzarella",
        parsley: "Ngò tây",
      },
    },
    // button
    button: {
      orderNow: "Đặt hàng",
      addToCart: "Thêm vào giỏ hàng",
      exploreMenu: "Khám Phá Thực Đơn",
      visitOurBakery: "Ghé Thăm Tiệm Bánh",
      viewDetail: "Chi tiết",
      backToMenu: "Về thực đơn",
      filter: "Bộ lọc",
      apply: "Áp dụng",
      signin: "Đăng nhập",
      clearFilter: "Xóa bộ lọc",
    },

    // footer
    footer: {
      brand: {
        description:
          "Petit Bakery làm bánh từ những nguyên liệu chân thật và sự chăm chút thật tâm, để mỗi lần ghé qua đều thấy ấm áp như về nhà.",
      },
      menu: {
        title: "Thực Đơn",
        links: {
          bestsellers: "Bán Chạy Nhất",
          standards: "Tiêu Chuẩn Của Chúng Tôi",
          whyChoose: "Vì Sao Chọn Chúng Tôi",
        },
      },
      about: {
        title: "Về Chúng Tôi",
        links: {
          ourStory: "Câu Truyện",
          ourBakery: "Tiệm Bánh Của Chúng Tôi",
          getInTouch: "Liên Hệ Ngay",
        },
      },
      visit: {
        title: "Ghé Thăm Chúng Tôi",
        address: "123 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh",
        phone: "0123 456 789",
        email: "hello@petitbakery.com",
        hours: "Mở Cửa Hằng Ngày: 6:00 – 20:00",
      },
      copyright: "© 2026 Petit Bakery. Làm bằng cả tình yêu, mỗi ngày.",
    },

    // order page
    orderPage: {
      signInRequired: {
        title: "Đăng nhập để đặt hàng",
        message: "Vui lòng đăng nhập để chúng tôi chuẩn bị đơn hàng cho bạn.",
      },
      info: {
        title: "Thông Tin Giao Hàng",
        fullName: "Tên Người Nhận",
        fullNamePlaceholder: "Nguyễn Văn A",
        phone: "Số Điện Thoại",
        phonePlaceholder: "090 123 4567",
        city: "Tỉnh / Thành Phố",
        cityPlaceholder: "-- Chọn tỉnh / thành phố --",
        district: "Quận / Huyện",
        districtPlaceholder: "-- Chọn quận / huyện --",
        selectCityFirst: "Vui lòng chọn tỉnh / thành phố trước",
        ward: "Phường / Xã",
        wardPlaceholder: "-- Chọn phường / xã --",
        selectDistrictFirst: "Vui lòng chọn quận / huyện trước",
        loading: "Đang tải...",
        address: "Địa Chỉ Cụ Thể",
        addressPlaceholder: "Số nhà, tên đường...",
        note: "Ghi Chú",
        notePlaceholder: "Vd: gọi trước khi giao, để ở lễ tân...",
      },
      payment: {
        title: "Phương Thức Thanh Toán",
        visa: {
          title: "Thanh Toán Bằng Thẻ",
          description: "Thẻ Visa, Mastercard và các thẻ ghi nợ/tín dụng khác",
        },
        payos: {
          title: "Thanh Toán Qua PayOS",
          description: "Quét mã QR để thanh toán nhanh chóng, an toàn",
          comingSoon: "Thanh toán qua PayOS sẽ được cập nhật sau.",
        },
      },
      summary: {
        title: "Đơn Hàng Của Bạn",
        itemCount: "{count} món",
        empty: "Giỏ hàng của bạn đang trống",
        browseMenu: "Xem Thực Đơn",
        subtotal: "Tạm Tính",
        shippingFee: "Phí Vận Chuyển",
        free: "Miễn Phí",
        total: "Tổng Cộng",
        placeOrder: "Thanh Toán",
        scanToPay: "Quét mã QR để thanh toán qua PayOS",
        paymentSuccess: "Thanh toán thành công",
        disclaimer:
          "Đây chỉ là giao diện minh hoạ — đơn hàng chưa được gửi đi.",
      },
      errors: {
        fullNameRequired: "Vui lòng nhập tên người nhận.",
        phoneRequired: "Vui lòng nhập số điện thoại.",
        phoneInvalid: "Số điện thoại không hợp lệ.",
        cityRequired: "Vui lòng nhập tỉnh / thành phố.",
        districtRequired: "Vui lòng nhập quận / huyện.",
        wardRequired: "Vui lòng nhập phường / xã.",
        addressRequired: "Vui lòng nhập địa chỉ cụ thể.",
      },
      result: {
        success: {
          title: "Thanh toán thành công",
          message: "Đơn hàng của bạn đã được đặt và thanh toán thành công.",
        },
        fail: {
          title: "Thanh toán thất bại",
          message:
            "Chúng tôi không thể xử lý thanh toán của bạn. Vui lòng thử lại hoặc dùng thẻ khác.",
        },
        backToMenu: "Xem Thực Đơn",
        tryAgain: "Thử Lại",
        orderNumber: "Đơn hàng #{id}",
        loading: "Đang tải thông tin đơn hàng...",
        items: "Sản Phẩm",
        deliveryInfo: "Thông Tin Giao Hàng",
        store: "Cửa Hàng",
      },
      toastSuccess: "Đặt hàng thành công!",
      toastError: "Đặt hàng thất bại. Vui lòng thử lại.",
    },

    // admin
    admin: {
      headerBreadcrumb: {
        dashboard: "Tổng quan",
        categories: "Danh mục sản phẩm",
        ingredients: "Nguyên liệu sản phẩm",
        orders: "Đơn hàng",
        products: "Sản phẩm",
        reviews: "Đánh giá",
        customers: "Khách hàng",
        settings: "Cài đặt",
        staffs: "Nhân viên",
        stores: "Cửa hàng",
        storeInventories: "Tồn kho cửa hàng",
      },
      headerDropdown: {
        notifications: "Thông báo",
        account: "Tài khoản",
        profile: "Hồ sơ",
        accountSettings: "Cài đặt tài khoản",
        signOut: "Đăng xuất",
      },
      // sidebar
      sidebar: {
        groups: {
          management: "Quản lý",
          storeManagement: "Quản lý cửa hàng",
          products: "Sản phẩm",
          system: "Hệ thống",
        },
        nav: {
          dashboard: "Tổng quan",
          stores: "Cửa hàng",
          orders: "Đơn hàng",
          products: "Sản phẩm",
          categories: "Danh mục",
          ingredients: "Nguyên liệu",
          reviews: "Đánh giá",
          customers: "Khách hàng",
          settings: "Cài đặt",
          staffs: "Nhân viên",
          storeInventories: "Tồn kho cửa hàng",
        },
        user: {
          profile: "Hồ sơ",
          account: "Tài khoản",
          signOut: "Đăng xuất",
        },
      },
      // dashboard page
      dashboardPage: {
        headerTitle: {
          title: "Tổng quan",
          subtitle: "Tổng quan hoạt động của Petit Bakery",
        },
      },
      // shared table
      table: {
        columns: {
          no: "#",
          status: "Trạng thái",
          createdAt: "Ngày tạo",
          actions: "Thao tác",
        },
        pagination: {
          showing: "Hiển thị",
          of: "trên",
          previous: "Trước",
          next: "Sau",
        },
      },
      // shared modal strings
      modal: {
        cancel: "Huỷ",
        saveChanges: "Lưu thay đổi",
        loading: "Đang tải...",
        image: "Hình ảnh",
        pickImage: "Chọn ảnh",
        descriptionVi: "Mô tả (VI)",
        descriptionEn: "Mô tả (EN)",
      },
      productsPage: {
        headerTitle: {
          title: "Sản phẩm",
          subtitle: "Tổng quan danh sách sản phẩm",
        },
        table: {
          columns: {
            image: "Hình ảnh",
            name: "Tên sản phẩm",
            price: "Giá sản phẩm",
            category: "Danh mục",
          },
        },
        createModal: {
          trigger: "Tạo sản phẩm",
          title: "Tạo sản phẩm mới",
          submit: "Tạo sản phẩm",
          fields: {
            nameVi: "Tên (VI)",
            nameEn: "Tên (EN)",
            price: "Giá (VND)",
            descriptionVi: "Mô tả (VI)",
            descriptionEn: "Mô tả (EN)",
            category: "Danh mục",
            categoryPlaceholder: "-- Chọn danh mục --",
            ingredients: "Nguyên liệu",
            noIngredients: "Không có nguyên liệu.",
          },
          errors: {
            nameViRequired: "Tên tiếng Việt không được để trống.",
            priceRequired: "Giá phải lớn hơn 0.",
            categoryRequired: "Vui lòng chọn danh mục.",
          },
        },
        updateModal: {
          title: "Chỉnh sửa sản phẩm",
          submit: "Lưu thay đổi",
          fields: {
            nameVi: "Tên (VI)",
            nameEn: "Tên (EN)",
            price: "Giá (VND)",
            descriptionVi: "Mô tả (VI)",
            descriptionEn: "Mô tả (EN)",
            category: "Danh mục",
            categoryPlaceholder: "-- Chọn danh mục --",
            ingredients: "Nguyên liệu",
            noIngredients: "Không có nguyên liệu.",
          },
          errors: {
            nameViRequired: "Tên tiếng Việt không được để trống.",
            priceRequired: "Giá phải lớn hơn 0.",
            categoryRequired: "Vui lòng chọn danh mục.",
          },
        },
      },
      categoriesPage: {
        headerTitle: {
          title: "Danh mục",
          subtitle: "Tổng quan danh mục sản phẩm",
        },
        table: {
          columns: {
            name: "Tên danh mục",
            description: "Mô tả",
          },
        },
        createModal: {
          trigger: "Tạo danh mục",
          title: "Tạo danh mục mới",
          submit: "Tạo danh mục",
          fields: {
            nameVi: "Tên danh mục (VI)",
            nameEn: "Tên danh mục (EN)",
            descriptionVi: "Mô tả (VI)",
            descriptionEn: "Mô tả (EN)",
          },
          errors: {
            nameViRequired: "Tên danh mục (VI) không được để trống.",
            nameEnRequired: "Tên danh mục (EN) không được để trống.",
          },
        },
        updateModal: {
          title: "Chỉnh sửa danh mục",
          submit: "Lưu thay đổi",
          fields: {
            nameVi: "Tên danh mục (VI)",
            nameEn: "Tên danh mục (EN)",
            descriptionVi: "Mô tả (VI)",
            descriptionEn: "Mô tả (EN)",
          },
          errors: {
            nameViRequired: "Tên danh mục (VI) không được để trống.",
            nameEnRequired: "Tên danh mục (EN) không được để trống.",
          },
        },
      },
      ingredientsPage: {
        headerTitle: {
          title: "Nguyên liệu",
          subtitle: "Tổng quan nguyên liệu sản phẩm",
        },
        table: {
          columns: {
            name: "Tên nguyên liệu",
          },
        },
        createModal: {
          trigger: "Tạo nguyên liệu",
          title: "Tạo nguyên liệu mới",
          submit: "Tạo nguyên liệu",
          fields: {
            nameVi: "Tên nguyên liệu (VI)",
            nameEn: "Tên nguyên liệu (EN)",
          },
          errors: {
            nameViRequired: "Tên nguyên liệu (VI) không được để trống.",
            nameEnRequired: "Tên nguyên liệu (EN) không được để trống.",
          },
        },
        updateModal: {
          title: "Chỉnh sửa nguyên liệu",
          submit: "Lưu thay đổi",
          fields: {
            nameVi: "Tên nguyên liệu (VI)",
            nameEn: "Tên nguyên liệu (EN)",
          },
          errors: {
            nameViRequired: "Tên nguyên liệu (VI) không được để trống.",
            nameEnRequired: "Tên nguyên liệu (EN) không được để trống.",
          },
        },
      },
      storesPage: {
        headerTitle: {
          title: "Cửa hàng",
          subtitle: "Quản lý các cửa hàng",
        },
        table: {
          columns: {
            name: "Tên cửa hàng",
            address: "Địa chỉ",
            phone: "Số điện thoại",
            image: "Hình ảnh",
            type: "Loại",
          },
        },
        createModal: {
          trigger: "Tạo cửa hàng",
          title: "Tạo cửa hàng mới",
          submit: "Tạo cửa hàng",
          fields: {
            name: "Tên cửa hàng",
            addressVi: "Địa chỉ (VI)",
            addressEn: "Địa chỉ (EN)",
            city: "Thành phố",
            district: "Quận/Huyện",
            phone: "Số điện thoại",
            imageUrl: "Hình ảnh",
            type: "Loại",
          },
          errors: {
            nameRequired: "Tên cửa hàng không được để trống.",
            addressViRequired: "Địa chỉ (VI) không được để trống.",
            addressEnRequired: "Địa chỉ (EN) không được để trống.",
            typeRequired: "Loại cửa hàng không được để trống.",
          },
        },
        updateModal: {
          title: "Chỉnh sửa cửa hàng",
          submit: "Lưu thay đổi",
          fields: {
            name: "Tên cửa hàng",
            addressVi: "Địa chỉ (VI)",
            addressEn: "Địa chỉ (EN)",
            city: "Thành phố",
            district: "Quận/Huyện",
            phone: "Số điện thoại",
            type: "Loại",
            status: "Trạng thái",
            statusActive: "Hoạt động",
            statusInactive: "Không hoạt động",
          },
          errors: {
            nameRequired: "Tên cửa hàng không được để trống.",
            addressViRequired: "Địa chỉ (VI) không được để trống.",
            addressEnRequired: "Địa chỉ (EN) không được để trống.",
            typeRequired: "Loại cửa hàng không được để trống.",
          },
        },
      },
      storeInventoriesPage: {
        headerTitle: {
          title: "Tồn kho cửa hàng",
          subtitle: "Quản lý số lượng tồn kho sản phẩm của cửa hàng",
        },
        table: {
          columns: {
            image: "Hình ảnh",
            name: "Tên sản phẩm",
            plannedQuantity: "Số lượng ban đầu",
            remainQuantity: "Số lượng còn lại",
            updatedBy: "Người cập nhật",
            status: "Trạng thái",
            businessDate: "Ngày bán",
          },
        },
        status: {
          available: "Còn hàng",
          out_of_stock: "Hết hàng",
          low_stock: "Sắp hết hàng",
          draft: "Bản nháp",
          unknown: "Không xác định",
        },
        storeSelect: {
          loading: "Đang tải cửa hàng...",
          empty: "Không có cửa hàng nào",
        },
        empty: "Không tìm thấy sản phẩm tồn kho nào",
        showing: "Hiển thị",
        item: "sản phẩm",
      },
      staffsPage: {
        headerTitle: {
          title: "Quản lý nhân viên",
          subtitle: "Danh sách nhân viên trong hệ thống",
        },
        table: {
          columns: {
            fullname: "Họ và tên",
            email: "Email",
            store: "Cửa hàng",
            dob: "Ngày sinh",
            gender: "Giới tính",
          },
        },
        filter: {
          statusLabel: "Trạng thái",
          sortByLabel: "Sắp xếp theo",
          orderLabel: "Thứ tự",
          statusOptions: {
            all: "Tất cả",
            active: "Đang hoạt động",
            inactive: "Không hoạt động",
          },
          sortByOptions: {
            createdAt: "Ngày tạo",
            fullname: "Họ và tên",
          },
          orderOptions: {
            desc: "Giảm dần",
            asc: "Tăng dần",
          },
        },
        gender: {
          male: "Nam",
          female: "Nữ",
          other: "Khác",
        },
        status: {
          active: "Hoạt động",
          inactive: "Không hoạt động",
          disabled: "Đã vô hiệu hóa",
        },
        empty: "Không tìm thấy nhân viên nào",
        showing: "Hiển thị",
        staff: "nhân viên",
        searchPlaceholder: "Tìm theo tên hoặc email...",
        clearSearch: "Xóa tìm kiếm",
        deleteConfirm: "Bạn có chắc muốn xóa nhân viên này không?",
        createModal: {
          trigger: "Thêm nhân viên",
          title: "Thêm nhân viên mới",
          submit: "Thêm mới",
          fields: {
            fullname: "Họ và tên",
            email: "Email",
            dob: "Ngày sinh",
            gender: "Giới tính",
            fullnamePlaceholder: "Ví dụ: Nguyễn Văn A",
            store: "Cửa hàng",
            storePlaceholder: "Chọn cửa hàng",
            storeLoading: "Đang tải cửa hàng...",
          },
          genderOptions: {
            male: "Nam",
            female: "Nữ",
            other: "Khác",
          },
          errors: {
            fullnameRequired: "Họ và tên không được để trống.",
            emailRequired: "Email không được để trống.",
            emailInvalid: "Email không hợp lệ.",
            dobRequired: "Ngày sinh không được để trống.",
            storeRequired: "Cửa hàng không được để trống.",
          },
        },
        updateModal: {
          title: "Cập nhật nhân viên",
          submit: "Lưu thay đổi",
          fields: {
            fullname: "Họ và tên",
            email: "Email",
            dob: "Ngày sinh",
            gender: "Giới tính",
            fullnamePlaceholder: "Ví dụ: Nguyễn Văn A",
            store: "Cửa hàng",
            storePlaceholder: "Chọn cửa hàng",
            storeLoading: "Đang tải cửa hàng...",
          },
          genderOptions: {
            male: "Nam",
            female: "Nữ",
            other: "Khác",
          },
          errors: {
            fullnameRequired: "Họ và tên không được để trống.",
            emailRequired: "Email không được để trống.",
            emailInvalid: "Email không hợp lệ.",
            dobRequired: "Ngày sinh không được để trống.",
            storeRequired: "Cửa hàng không được để trống.",
          },
        },
      },
      orderPage: {
        headerTitle: {
          title: "Đơn hàng",
          subtitle: "Quản lý đơn hàng",
        },
        searchPlaceholder: "Tìm theo khách hàng hoặc mã đơn hàng...",
        empty: "Không tìm thấy đơn hàng nào",
        showing: "Hiển thị",
        order: "đơn hàng",
        status: {
          order: {
            pending: "Chờ xử lý",
            confirmed: "Đã xác nhận",
            preparing: "Đang chuẩn bị",
            shipping: "Đang giao",
            delivered: "Đã giao hàng",
            cancelled: "Đã hủy",
          },
          payment: {
            unpaid: "Chưa thanh toán",
            paid: "Đã thanh toán",
            failed: "Thanh toán thất bại",
            refunded: "Đã hoàn tiền",
          },
        },
        table: {
          columns: {
            customer: "Khách hàng",
            orderCode: "Mã đơn hàng",
            store: "Cửa hàng",
            orderStatus: "Trạng thái đơn hàng",
            paymentStatus: "Trạng thái thanh toán",
            total: "Tổng cộng",
            paymentMethod: "Phương thức thanh toán",
            createdAt: "Ngày tạo",
          },
        },
      },
    },

    // staff
    staff: {
      headerBreadcrumb: {
        dashboard: "Tổng quan",
        orders: "Đơn hàng",
        staffs: "Nhân viên",
        reviews: "Đánh giá",
        storeInventories: "Tồn kho cửa hàng",
      },
      headerDropdown: {
        profile: "Hồ sơ",
        accountSettings: "Cài đặt tài khoản",
        signOut: "Đăng xuất",
      },
      // sidebar
      sidebar: {
        groups: {
          management: "Quản lý",
        },
        nav: {
          dashboard: "Tổng quan",
          staffs: "Nhân viên",
          orders: "Đơn hàng",
          reviews: "Đánh giá",
          customers: "Khách hàng",
          storeInventories: "Tồn kho cửa hàng",
        },
        user: {
          profile: "Hồ sơ",
          account: "Tài khoản",
          signOut: "Đăng xuất",
        },
      },
      // dashboard page
      dashboardPage: {
        headerTitle: {
          title: "Tổng quan",
          subtitle: "Tổng quan hoạt động của cửa hàng",
        },
      },
      modal: {
        cancel: "Huỷ",
      },
      storeInventoriesPage: {
        createModal: {
          trigger: "Cập nhật sản phẩm",
          title: "Cập nhật số lượng sản phẩm",
          submit: "Lưu thay đổi",
          addRow: "Thêm dòng",
          fields: {
            product: "Sản phẩm",
            quantity: "Số lượng",
          },
          productSelect: {
            placeholder: "Chọn sản phẩm",
            loading: "Đang tải sản phẩm...",
            empty: "Không có sản phẩm đang hoạt động",
          },
          errors: {
            productRequired: "Vui lòng chọn sản phẩm.",
            duplicateProduct: "Sản phẩm này đã được thêm.",
            quantityInvalid: "Số lượng phải lớn hơn hoặc bằng 0.",
            fetchProductsFailed: "Không thể tải danh sách sản phẩm.",
            submitFailed: "Không thể thêm sản phẩm vào kho.",
          },
        },
      },
    },
  },
};

export type Locale = "en" | "vi";
