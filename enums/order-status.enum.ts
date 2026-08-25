export enum OrderEnum {
  Pending = "pending",
  Confirmed = "confirmed",
  Preparing = "preparing",
  Shipping = "shipping",
  Delivered = "delivered",
  Cancelled = "cancelled",
}

export enum PaymentStatusEnum {
  Unpaid = "unpaid",
  Paid = "paid",
  Failed = "failed",
  Refunded = "refunded",
}

export enum PaymentMethodEnum {
  PayOS = "payos",
  Visa = "visa",
}
