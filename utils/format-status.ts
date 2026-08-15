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

export const formatOrderStatusColor = (status: string): string => {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";

    case "confirmed":
      return "bg-blue-100 text-blue-700 border-blue-200";

    case "preparing":
      return "bg-orange-100 text-orange-700 border-orange-200";

    case "shipping":
      return "bg-purple-100 text-purple-700 border-purple-200";

    case "delivered":
      return "bg-green-100 text-green-700 border-green-200";

    case "cancelled":
      return "bg-red-100 text-red-700 border-red-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
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

export const formatOrderPaymentStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case "unpaid":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";

    case "paid":
      return "bg-green-100 text-green-700 border-green-200";

    case "failed":
      return "bg-red-100 text-red-700 border-red-200";

    case "refunded":
      return "bg-purple-100 text-purple-700 border-purple-200";

    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
};
