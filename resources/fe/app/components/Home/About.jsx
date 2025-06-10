import React from "react";

const About = () => {
    return (
        <section className="relative w-[1200px] flex items-center justify-center bg-cover bg-center mx-auto mt-5 rounded-2xl">
            <div className="container mx-auto flex flex-col bg-white border-gray-200 rounded-xl p-10 shadow-lg">
                {/* Row containing Text & Logo */}
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between">

                    {/* Text Section */}
                    <div className="md:w-2/3 space-y-6">
                        <h2 className="text-5xl font-bold text-gray-900">LOS POLLOS HERMANOS</h2>
                        <h3 className="text-2xl text-gray-700 font-semibold">Rau câu kỳ diệu</h3>

                        <p className="text-gray-700 text-2xl leading-relaxed">
                            {/* Là một món tráng miệng thơm ngon và mát lạnh, rau câu đã được yêu thích bởi hương vị thanh nhẹ
                            cùng kết cấu dẻo dai, giòn sần sật. Được làm từ bột rau câu thiên nhiên kết hợp với các nguyên
                            liệu phong phú như nước cốt dừa, cà phê, lá dứa, trái cây tươi hay thạch sữa, rau câu không chỉ
                            mang đến sự tươi mát mà còn bổ sung nhiều dưỡng chất có lợi cho sức khỏe. */}
                            Chào mừng đến với Los Pollos Hermanos. 
                            Chúng tôi tự hào mang đến cho bạn những món gà rán truyền thống chất lượng cao, 
                            được chế biến bằng những nguyên liệu hảo hạng nhất và lòng tận tâm tuyệt đối. 
                            Ở Los Pollos Hermanos, chúng tôi hiểu hương vị của gia đình là như thế nào, 
                            và chúng tôi đem lại hơi ấm và hương vị đó trong từng món ăn mỗi ngày.
                        </p>
                    </div>

                    {/* Logo Section */}
                    <div className="md:w-1/3 flex justify-center md:justify-end overflow-hidden">
                        <img
                            src="/storage/build/assets/Logo.png"
                            alt="Los Pollos Hermanos"
                            className="w-[100%] h-auto"
                        />
                    </div>
                </div>

                {/* Infor 2 (Appears Below) */}
                <div className="mt-10">
                    <p className="text-gray-700 text-2xl leading-relaxed">
                        Gia đình bạn xứng đáng với điều tốt nhất — và đó chính là những giá trị mà chúng tôi luôn trân trọng.{" "}
                        <span className="font-semibold text-gray-800">Los Pollos Hermanos</span> mang đến những món ăn ngon miệng và ấm áp,
                        được chăm chút bằng cả trái tim. Đó là ưu tiên hàng đầu của chúng tôi.
                    </p>
                </div>

                {/* Contact Info */}
                {/* <div className="mt-6 flex flex-col md:flex-row items-start md:items-center md:space-x-6">
                    <div className="flex items-center space-x-3">
                        <svg className="w-7 h-7 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.095 0 2.238.195 2.238.195v2.46h-1.26c-1.242 0-1.63.775-1.63 1.57V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z" />
                        </svg>
                        <a href="https://www.facebook.com/duyen.nguyen.344258" target="_blank" rel="noopener noreferrer" className="hover:text-gray-200 transition-all text-lg font-semibold text-gray-800">Los Pollos Hermanos</a>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-gray-700 text-lg">📞 0123456789</span>
                    </div>
                </div> */}
            </div>
        </section>
    );
};

export default About;
