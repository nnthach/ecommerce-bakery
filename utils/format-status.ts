export const formatOrderStatus = (status: string): string => {
  switch (status) {
    case "pending":
      return "pending";

    case "confirmed":
      return "confirmed";

    case "preparing":
      return "preparing";

    case "shipping":
      return "shipping";

    case "delivered":
      return "delivered";

    case "cancelled":
      return "cancelled";

    default:
      return status;
  }
};

export const formatOrderPaymentStatus = (status: string): string => {
  switch (status) {
    case "unpaid":
      return "unpaid";

    case "paid":
      return "paid";

    case "failed":
      return "failed";

    case "refunded":
      return "refunded";

    default:
      return status;
  }
};
