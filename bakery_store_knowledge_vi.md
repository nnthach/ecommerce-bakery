# Knowledge Base - Thông tin cửa hàng bánh

## 1. Mục đích tài liệu

Tài liệu này chứa các thông tin tương đối ổn định về cửa hàng bánh để sử dụng cho hệ thống RAG của chatbot.

Chatbot có thể sử dụng tài liệu này để trả lời các câu hỏi liên quan đến:

- Giới thiệu cửa hàng
- Vị trí cửa hàng
- Thời gian bắt đầu nhận đơn online
- Chính sách giao hàng
- Khu vực giao hàng
- Phí giao hàng
- Thời gian giao hàng dự kiến
- Chính sách hủy đơn
- Chính sách đổi/trả
- Chính sách xử lý sản phẩm bị hỏng
- Chính sách sản phẩm bị giao sai hoặc thiếu
- Chính sách thanh toán
- Các câu hỏi thường gặp

Thông tin về tồn kho, giá sản phẩm hiện tại, trạng thái đơn hàng và trạng thái thanh toán nên được lấy trực tiếp từ database hoặc backend API thay vì chỉ dựa vào tài liệu RAG này.

---

# 2. Giới thiệu về cửa hàng

Cửa hàng là một tiệm bánh hoạt động tại Thành phố Hồ Chí Minh, Việt Nam.

Cửa hàng tập trung cung cấp các loại bánh và sản phẩm bakery được chuẩn bị theo kế hoạch sản xuất hằng ngày.

Một số sản phẩm được làm theo mô hình daily-bake, nghĩa là số lượng bánh được chuẩn bị mỗi ngày có giới hạn. Vì vậy, số lượng sản phẩm có thể thay đổi trong ngày và một số sản phẩm có thể hết hàng.

Khách hàng có thể xem sản phẩm và đặt hàng trực tiếp thông qua website của cửa hàng.

Cửa hàng hướng tới:

- Cung cấp bánh tươi và được chuẩn bị cẩn thận.
- Cung cấp thông tin sản phẩm rõ ràng.
- Cho phép khách hàng đặt bánh trực tuyến thuận tiện.
- Cung cấp dịch vụ giao hàng trong khu vực hỗ trợ.
- Đóng gói sản phẩm cẩn thận.
- Hỗ trợ khách hàng khi có vấn đề với đơn hàng.

---

# 3. Vị trí cửa hàng

Cửa hàng hiện đang hoạt động tại:

**Thành phố Hồ Chí Minh, Việt Nam**

Nếu khách hàng hỏi địa chỉ cụ thể nhưng hệ thống chưa có thông tin địa chỉ chính xác trong knowledge base, chatbot không được tự tạo hoặc đoán địa chỉ.

Trong trường hợp này, chatbot có thể trả lời rằng cửa hàng hiện hoạt động tại Thành phố Hồ Chí Minh và hướng dẫn khách hàng liên hệ cửa hàng để lấy địa chỉ chính xác.

---

# 4. Thời gian đặt hàng online

Khách hàng có thể truy cập website để xem sản phẩm bất cứ lúc nào.

Tuy nhiên, thời gian bắt đầu nhận đơn online cho các sản phẩm trong ngày là:

**10:00 sáng**

Khách hàng có thể bắt đầu đặt các sản phẩm được mở bán trong ngày từ **10:00 sáng**.

Trước 10:00 sáng, nhân viên có thể đang chuẩn bị sản phẩm và cập nhật số lượng bánh trong ngày. Vì vậy, một số sản phẩm có thể đã hiển thị trên website nhưng chưa được phép đặt hàng.

Chatbot cần phân biệt:

- Thời gian khách hàng có thể truy cập website.
- Thời gian bắt đầu nhận đơn online.
- Thời gian mở cửa thực tế của cửa hàng.

Quy tắc quan trọng:

**Đơn hàng online cho các sản phẩm trong ngày bắt đầu được nhận từ 10:00 sáng.**

---

# 5. Sản phẩm daily-bake và tình trạng sản phẩm

Một số sản phẩm được quản lý theo số lượng sản xuất hằng ngày.

Nhân viên có thể cập nhật số lượng bánh dự kiến sản xuất cho từng ngày.

Tình trạng sản phẩm có thể thay đổi trong ngày, ví dụ:

- Chưa mở bán
- Đang bán
- Sắp hết
- Hết hàng

Một sản phẩm xuất hiện trên website không đồng nghĩa với việc sản phẩm đó luôn có thể đặt hàng.

Tình trạng còn hàng thực tế phải được kiểm tra từ hệ thống inventory.

Nếu khách hàng hỏi:

- "Bánh này còn không?"
- "Hôm nay còn bao nhiêu bánh?"
- "Bây giờ tôi có đặt bánh này được không?"
- "Bánh này đã hết chưa?"

Chatbot phải ưu tiên lấy dữ liệu tồn kho hiện tại từ database/backend API.

Không được sử dụng một chunk RAG cũ để khẳng định tình trạng tồn kho hiện tại.

---

# 6. Dịch vụ giao hàng

Cửa hàng hiện cung cấp dịch vụ giao hàng tại Thành phố Hồ Chí Minh.

Phạm vi giao hàng tiêu chuẩn được tính dựa trên khoảng cách từ cửa hàng đến địa chỉ giao hàng của khách.

Khoảng cách giao hàng tiêu chuẩn tối đa:

**10 km**

Các đơn hàng có khoảng cách trên 10 km hiện không nằm trong phạm vi giao hàng tiêu chuẩn.

Nếu khách hàng cung cấp địa chỉ cụ thể, hệ thống nên sử dụng dịch vụ tính khoảng cách để xác định khoảng cách thực tế.

Không được chỉ dựa vào tên quận/huyện để kết luận chính xác phí giao hàng, vì khoảng cách thực tế có thể khác nhau giữa các địa chỉ trong cùng một khu vực.

---

# 7. Phí giao hàng

Phí giao hàng tiêu chuẩn được tính dựa trên khoảng cách từ cửa hàng đến địa chỉ nhận hàng.

| Khoảng cách | Phí giao hàng |
|---|---:|
| Từ 0 km đến 3 km | 15.000 VNĐ |
| Trên 3 km đến 5 km | 25.000 VNĐ |
| Trên 5 km đến 10 km | 35.000 VNĐ |
| Trên 10 km | Không hỗ trợ giao hàng tiêu chuẩn |

## Ví dụ

### Trong phạm vi 3 km

Phí giao hàng:

**15.000 VNĐ**

### Trên 3 km đến 5 km

Phí giao hàng:

**25.000 VNĐ**

### Trên 5 km đến 10 km

Phí giao hàng:

**35.000 VNĐ**

### Trên 10 km

Cửa hàng hiện không hỗ trợ giao hàng tiêu chuẩn.

Nếu khách hàng chỉ cung cấp tên khu vực, ví dụ "Quận 7", chatbot không nên tự khẳng định mức phí cụ thể. Cần biết địa chỉ cụ thể hoặc khoảng cách thực tế để xác định phí.

---

# 8. Thời gian giao hàng dự kiến

Thời gian giao hàng dự kiến thông thường:

**30 - 60 phút**

Thời gian thực tế có thể thay đổi tùy theo:

- Khoảng cách giao hàng.
- Tình trạng giao thông.
- Thời tiết.
- Số lượng đơn hàng tại thời điểm đó.
- Thời gian chuẩn bị sản phẩm.
- Tình trạng của đơn vị giao hàng.

Trong thời gian cao điểm, đơn hàng có thể mất nhiều thời gian hơn dự kiến.

Chatbot không được cam kết một thời gian giao hàng chính xác nếu hệ thống chưa có thời gian giao hàng được xác nhận.

---

# 9. Chính sách giao hàng

## 9.1. Khu vực giao hàng

Cửa hàng hỗ trợ giao hàng tiêu chuẩn trong Thành phố Hồ Chí Minh với khoảng cách tối đa khoảng 10 km tính từ cửa hàng.

Khoảng cách thực tế cần được xác định dựa trên địa chỉ giao hàng.

## 9.2. Phí giao hàng

Phí giao hàng tiêu chuẩn:

- 0 - 3 km: 15.000 VNĐ.
- Trên 3 - 5 km: 25.000 VNĐ.
- Trên 5 - 10 km: 35.000 VNĐ.
- Trên 10 km: không hỗ trợ giao hàng tiêu chuẩn.

Cửa hàng có thể áp dụng chương trình miễn phí giao hàng hoặc khuyến mãi trong từng thời điểm. Nếu có chương trình khuyến mãi mới, thông tin mới nhất cần được cập nhật vào knowledge base hoặc hệ thống khuyến mãi.

## 9.3. Thông tin khách hàng cần cung cấp

Khi đặt hàng giao tận nơi, khách hàng cần cung cấp:

- Họ tên người nhận.
- Số điện thoại.
- Địa chỉ giao hàng đầy đủ.
- Ghi chú giao hàng nếu cần.

Địa chỉ không đầy đủ hoặc không chính xác có thể làm chậm quá trình giao hàng.

## 9.4. Liên hệ khi giao hàng

Khách hàng nên giữ điện thoại trong thời gian chờ nhận hàng để nhân viên giao hàng có thể liên hệ.

Nếu không thể liên hệ được với khách hàng sau nhiều lần thử hợp lý, đơn hàng có thể bị trì hoãn hoặc được đưa về cửa hàng.

Nếu cần giao lại, có thể phát sinh thêm chi phí giao hàng tùy trường hợp.

---

# 10. Chính sách hủy đơn hàng

Khách hàng có thể yêu cầu hủy đơn trước khi cửa hàng bắt đầu quá trình chuẩn bị đơn hàng.

Sau khi đơn hàng đã bắt đầu được chuẩn bị, việc hủy đơn có thể không còn được chấp nhận.

Đối với đơn hàng đã thanh toán trước:

- Nếu hủy đơn được chấp nhận trước khi cửa hàng bắt đầu chuẩn bị, cửa hàng sẽ xử lý hoàn tiền theo quy định.
- Nếu đơn hàng đã được chuẩn bị, khả năng hoàn tiền có thể bị hạn chế.
- Phí giao hàng đã phát sinh có thể không được hoàn lại.

Khách hàng nên liên hệ với cửa hàng càng sớm càng tốt nếu muốn hủy đơn.

Chatbot không được tự động cam kết rằng khách hàng chắc chắn được hoàn tiền. Trước khi xác nhận, cần kiểm tra trạng thái đơn hàng và trạng thái thanh toán thực tế.

---

# 11. Chính sách đổi và trả sản phẩm

Do bánh là sản phẩm thực phẩm và một số sản phẩm có thể được chuẩn bị theo đơn hàng cụ thể, cửa hàng nhìn chung không hỗ trợ trả hàng chỉ vì khách hàng thay đổi ý định.

Tuy nhiên, cửa hàng có thể hỗ trợ đổi sản phẩm, thay thế sản phẩm hoặc hoàn tiền nếu sản phẩm gặp vấn đề thuộc trách nhiệm của cửa hàng.

Các trường hợp có thể được xem xét:

- Giao sai sản phẩm.
- Thiếu sản phẩm trong đơn.
- Sản phẩm bị hư hỏng nghiêm trọng trước hoặc trong quá trình giao hàng.
- Sản phẩm không đúng với đơn hàng đã xác nhận.
- Sản phẩm có vấn đề về chất lượng do lỗi từ cửa hàng.

Khách hàng nên liên hệ với cửa hàng càng sớm càng tốt sau khi nhận hàng.

Để hỗ trợ xử lý, khách hàng có thể cần cung cấp:

- Mã đơn hàng.
- Hình ảnh hoặc video sản phẩm.
- Mô tả vấn đề.
- Thông tin giao hàng.

Sau khi kiểm tra, cửa hàng có thể đưa ra một trong các phương án:

- Đổi sản phẩm.
- Giao sản phẩm thay thế.
- Hoàn tiền một phần.
- Hoàn tiền toàn bộ.
- Một phương án xử lý phù hợp khác.

Phương án cuối cùng phụ thuộc vào tình trạng thực tế của từng trường hợp.

---

# 12. Chính sách sản phẩm bị hỏng

Nếu bánh hoặc sản phẩm bị hỏng khi khách hàng nhận hàng, khách hàng nên:

1. Giữ lại sản phẩm và bao bì.
2. Chụp hình hoặc quay video tình trạng sản phẩm.
3. Liên hệ với cửa hàng càng sớm càng tốt.
4. Cung cấp mã đơn hàng.
5. Mô tả vấn đề xảy ra.

Cửa hàng sẽ kiểm tra tình trạng sản phẩm và nguyên nhân.

Nếu xác định vấn đề thuộc trách nhiệm của cửa hàng hoặc quá trình giao hàng, cửa hàng có thể hỗ trợ đổi sản phẩm hoặc hoàn tiền tùy trường hợp.

Chatbot không được tự quyết định rằng khách hàng chắc chắn được hoàn tiền nếu chưa có thông tin xác minh.

---

# 13. Chính sách giao sai hoặc thiếu sản phẩm

Nếu khách hàng nhận được sản phẩm khác với sản phẩm đã đặt, khách hàng nên liên hệ với cửa hàng ngay khi phát hiện vấn đề.

Nếu đơn hàng bị thiếu sản phẩm, cửa hàng sẽ kiểm tra:

- Thông tin đơn hàng.
- Danh sách sản phẩm trong đơn.
- Thông tin đóng gói.
- Thông tin giao hàng.

Nếu xác nhận lỗi thuộc về cửa hàng, cửa hàng có thể hỗ trợ:

- Giao bổ sung sản phẩm.
- Thay thế sản phẩm.
- Hoàn tiền cho sản phẩm bị thiếu hoặc giao sai.

---

# 14. Chính sách thanh toán

Website hỗ trợ thanh toán trực tuyến thông qua PayOS.

Quy trình thanh toán cơ bản:

1. Khách hàng tạo đơn hàng.
2. Hệ thống tạo thông tin thanh toán.
3. Khách hàng thực hiện thanh toán.
4. PayOS xử lý giao dịch.
5. Hệ thống nhận thông tin xác nhận thanh toán.
6. Hệ thống cập nhật trạng thái thanh toán.
7. Đơn hàng được xác nhận khi thanh toán thành công.

Việc khách hàng mở trang thanh toán hoặc tạo payment link không đồng nghĩa với việc đơn hàng đã thanh toán thành công.

Nếu khách hàng bị trừ tiền nhưng đơn hàng chưa được xác nhận, hệ thống cần kiểm tra trạng thái giao dịch và đơn hàng trước khi đưa ra kết luận.

---

# 15. Liên hệ cửa hàng

Cửa hàng hiện hoạt động tại:

**Thành phố Hồ Chí Minh, Việt Nam**

Nếu khách hàng yêu cầu thông tin liên hệ cụ thể như số điện thoại, email hoặc địa chỉ chính xác nhưng thông tin đó chưa được cập nhật trong knowledge base, chatbot không được tự tạo thông tin.

Chatbot nên thông báo rằng thông tin liên hệ cụ thể cần được kiểm tra từ thông tin cửa hàng mới nhất.

---

# 16. Câu hỏi thường gặp

## Cửa hàng bắt đầu nhận đơn lúc mấy giờ?

Cửa hàng bắt đầu nhận đơn online cho các sản phẩm trong ngày từ **10:00 sáng**.

## Cửa hàng ở đâu?

Cửa hàng hiện đang hoạt động tại **Thành phố Hồ Chí Minh, Việt Nam**.

Nếu cần địa chỉ đường cụ thể, khách hàng cần kiểm tra thông tin cửa hàng mới nhất hoặc liên hệ cửa hàng.

## Shop có giao hàng không?

Có. Cửa hàng hỗ trợ giao hàng tiêu chuẩn trong Thành phố Hồ Chí Minh với khoảng cách tối đa khoảng **10 km** từ cửa hàng.

## Phí giao hàng bao nhiêu?

Phí giao hàng tiêu chuẩn:

- 0 - 3 km: **15.000 VNĐ**
- Trên 3 - 5 km: **25.000 VNĐ**
- Trên 5 - 10 km: **35.000 VNĐ**
- Trên 10 km: **Không hỗ trợ giao hàng tiêu chuẩn**

## Giao hàng mất bao lâu?

Thời gian dự kiến thông thường là **30 - 60 phút**, tùy khoảng cách, giao thông, thời tiết, số lượng đơn hàng và thời gian chuẩn bị bánh.

## Tôi có thể hủy đơn không?

Có thể yêu cầu hủy đơn trước khi cửa hàng bắt đầu chuẩn bị đơn. Sau khi đơn đã được chuẩn bị, việc hủy có thể không được chấp nhận.

## Tôi có thể trả bánh không?

Thông thường không hỗ trợ trả bánh chỉ vì khách hàng thay đổi ý định. Tuy nhiên, cửa hàng có thể hỗ trợ nếu sản phẩm bị giao sai, thiếu, hư hỏng hoặc có vấn đề về chất lượng thuộc trách nhiệm của cửa hàng.

## Nếu bánh bị hỏng khi giao thì sao?

Khách hàng nên chụp hình hoặc quay video sản phẩm và liên hệ với cửa hàng càng sớm càng tốt, đồng thời cung cấp mã đơn hàng.

## Tại sao tôi thấy bánh trên website nhưng không đặt được?

Có thể sản phẩm chưa đến thời gian mở bán trong ngày hoặc sản phẩm đã hết số lượng. Đối với tình trạng còn hàng hiện tại, chatbot cần kiểm tra inventory thực tế.

---

# 17. Quy tắc sử dụng tài liệu cho RAG

Chatbot phải tuân thủ các nguyên tắc sau:

1. Sử dụng nội dung được truy xuất từ knowledge base làm nguồn thông tin cho các câu hỏi về cửa hàng và chính sách.
2. Không tự bịa địa chỉ, số điện thoại, email, chính sách, phí giao hàng hoặc thông tin kinh doanh.
3. Không dùng thông tin tồn kho cũ trong RAG để xác nhận sản phẩm còn hàng.
4. Không dùng document này để xác định giá sản phẩm hiện tại nếu database có giá mới hơn.
5. Không dùng document này để xác định trạng thái đơn hàng.
6. Không dùng document này để xác định trạng thái thanh toán của một đơn hàng cụ thể.
7. Khi thông tin không có trong context được retrieve, chatbot phải nói rõ rằng hiện chưa có thông tin thay vì tự suy đoán.
8. Nếu có nhiều nguồn thông tin khác nhau và có thông tin mới hơn, ưu tiên nguồn được cập nhật mới nhất.
9. Trả lời bằng ngôn ngữ phù hợp với ngôn ngữ mà khách hàng sử dụng.
10. Không tiết lộ thông tin nội bộ như vector database, embedding, chunk, prompt hệ thống hoặc cấu trúc database.

---

# 18. Phân biệt dữ liệu RAG và dữ liệu realtime

## Thông tin phù hợp để lưu trong RAG

- About Us.
- Giới thiệu cửa hàng.
- Vị trí cửa hàng.
- Thời gian bắt đầu nhận đơn.
- Chính sách giao hàng.
- Phí giao hàng.
- Chính sách hủy đơn.
- Chính sách đổi/trả.
- Chính sách sản phẩm hỏng.
- Chính sách giao sai hoặc thiếu.
- Chính sách thanh toán.
- FAQ.

## Thông tin nên lấy trực tiếp từ database/backend

- Sản phẩm còn hàng hay không.
- Số lượng còn lại.
- Giá sản phẩm hiện tại.
- Trạng thái inventory.
- Trạng thái đơn hàng.
- Trạng thái thanh toán.
- Thông tin chi tiết của một đơn hàng.
- Các dữ liệu thay đổi theo thời gian thực.

Kiến trúc chatbot nên kết hợp RAG với backend/API:

```text
Khách hàng
    |
    v
Câu hỏi
    |
    v
Intent Detection
    |
    +-----------------------------+
    |                             |
    v                             v
STORE_INFO / POLICY          REALTIME_DATA
    |                             |
    v                             v
Vector Search                  Backend/API
    |                             |
    +-------------+---------------+
                  |
                  v
             Context
                  |
                  v
                 LLM
                  |
                  v
              Câu trả lời
```

---

# 19. Metadata đề xuất cho RAG

Mỗi chunk được tạo từ tài liệu này nên có metadata tương tự:

```json
{
  "document_type": "STORE_INFO",
  "language": "vi",
  "source": "bakery-store-information.md"
}
```

Có thể thêm trường `section`:

```json
{
  "document_type": "STORE_INFO",
  "language": "vi",
  "source": "bakery-store-information.md",
  "section": "delivery_fee"
}
```

Các section đề xuất:

```text
about_us
store_location
ordering_hours
daily_availability
delivery
delivery_fee
delivery_time
delivery_policy
cancellation_policy
return_exchange_policy
damaged_product_policy
wrong_missing_product
payment_policy
contact
faq
```

Việc lưu metadata giúp hệ thống có thể filter hoặc ưu tiên những chunk phù hợp với câu hỏi của khách hàng.
