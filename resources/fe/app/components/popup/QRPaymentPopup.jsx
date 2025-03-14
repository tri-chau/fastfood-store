import {useEffect} from "react";
import {usePopup} from "../../hooks/contexts/popupContext/popupState.jsx";
import io from "socket.io-client";
import {formatVietnameseCurrency} from "../../locales/currencyFormat.js";
import {notify} from "../../layouts/Notification/notify.jsx";
import {useNavigate} from "react-router-dom";
import {getAllOrders} from "../../redux/action/orderAction.js";
import {useDispatch} from "react-redux";

const QRPaymentPopup = ({isVisible, cart, paymentLink}) => {

    if (!isVisible) return null;

    const {closePopup} = usePopup();
    const navigate = useNavigate();
    let socket = null;
    const dispatch = useDispatch();

    useEffect(() => {
        initSocketListener();
    }, []);

    const initSocketListener = () => {
        const socketURL = "https://socket.dotb.cloud/";
        socket = io.connect(socketURL, {path: "", transports: ["websocket"], reconnection: true});

        socket.on('connect', () => {
            console.log('Socket server is live!');
            socket.emit('join', `triggerPaymentStatus/${cart.order_id}`);
        });

        socket.on('error', () => {
            console.log('Cannot connect to socket server!');
        });

        socket.on('event-phenikaa', async (msg) => {
            if (msg.success) {
                // if (!socketStatus) {
                let message = 'Successfully pay for order ' + cart.name + ' with amount ' + formatVietnameseCurrency(cart.total_price);
                closePopup();
                notify('success', message);
                // setSocketStatus(true);
                await dispatch(getAllOrders());

                navigate('/orders'); // Navigate to order page
                // }
            } else {
                notify('error', 'Payment failed. Please try again.');
            }
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white p-4 w-[70vw] h-[80vh] rounded-lg">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Payment</h2>
                    <button onClick={closePopup} className="text-gray-500 hover:text-gray-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
                             viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <div className="mt-4">
                    <iframe src={paymentLink} title="Payment"
                            className="w-full h-[70vh] border border-gray-300 rounded-lg shadow-sm"/>
                </div>
            </div>
        </div>
    );
}

export default QRPaymentPopup;
