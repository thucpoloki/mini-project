// lib/mongodb.js
const mongoose = require("mongoose");
const fs = require("fs");

// Đọc mật khẩu từ file nhị phân
// const password = fs.readFileSync("lib/mongoDB-password.txt", "utf-8").trim();

// Lấy mật khẩu từ biến môi trường (.env)
const password = process.env.MONGO_DB_PASSWORD;

const MONGO_URI = `mongodb+srv://thucpoki25:dmthuc123@data-drivenwebsites-web.lmvqezg.mongodb.net/book?retryWrites=true&w=majority`;

// Đảm bảo rằng biến môi trường MONGO_URI đã được thiết lập
if (!MONGO_URI) {
    throw new Error("Vui lòng thiết lập biến môi trường MONGO_URI");
}

// Sử dụng biến toàn cục để lưu trữ kết nối
// .mongoose là một thuộc tính tùy ý được thêm vào đối tượng global để lưu trữ kết nối mongoose
let cached = global.mongoose;

if (!cached) {
    // Nếu không có cache, tạo một đối tượng cache mới với conn và promise đều là null.
    // Conn ở đây đại diện cho kết nối đã được thiết lập.
    // Promise ở đây đại diện cho một kết nối đang chờ được thiết lập.
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
    // Cache này sinh ra từ đâu? Vì sao sử dụng cache này?
    // Câu trả lời: Cache này được tạo ra để lưu trữ kết nối cơ sở dữ liệu và tránh việc tạo nhiều kết nối không cần thiết.
    // Nếu không có cache, mỗi lần gọi connectToDatabase() sẽ tạo một kết nối mới đến cơ sở dữ liệu.
    if (cached.conn) return cached.conn; // Sử dụng kết nối đã lưu trong bộ nhớ đệm

    if (!cached.promise) {
        console.log('Connecting to MongoDB...');
        // Nếu chưa có promise, tạo một promise mới để kết nối đến MongoDB
        // Với phương thức mongoose.connect truyền vào MONGO_URI (Là chuỗi kết nối), nó trả về một promise
        // .then() là phương thức của promise, nó sẽ được gọi khi promise được giải quyết thành công, trả về kết quả của promise
        // Lưu ý: Chúng ta không sử dụng await ở đây vì chúng ta muốn lưu trữ promise trong cache
        // Nếu sử dụng await, chúng ta sẽ chờ đợi kết nối hoàn thành trước khi lưu trữ, điều này sẽ làm mất đi lợi ích của việc sử dụng promise
        // Promise này sẽ được giải quyết khi kết nối đến MongoDB thành công.
        // Điều này giúp tái sử dụng kết nối mà không cần phải tạo mới mỗi lần gọi hàm.
        cached.promise = mongoose.connect(MONGO_URI).then(mongoose => {
            console.log('Connected to MongoDB'); // Debug
            return mongoose;
        });
    }

    // Chờ đợi promise được giải quyết và lưu kết nối vào cache
    cached.conn = await cached.promise;
    return cached.conn;
}

module.exports = connectToDatabase;