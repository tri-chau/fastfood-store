import React, { useEffect, useState } from "react";
import {notify} from "notiwind";
import {useDispatch} from "react-redux";
import {deleteCategory} from "../../../redux/action/categoryAction.js";

const DeleteCategoryModal = ({ isOpen, onClose, itemID }) => {
    const dispatch = useDispatch();
    const [item_id, setItemID] = useState("");

    // console.log("DeleteCategoryModal itemID1:", itemID);

    useEffect(() => {
        if (itemID) {
            setItemID(itemID);
        }
    }, [itemID]);

    const handleClosing = () => {
        setItemID("");
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!itemID) {
            notify({group: "foo", title: "Error", text: "Invalid category ID."}, 2000);
            return;
        }
        try {
            await dispatch(deleteCategory(item_id));
            notify({group: "foo", title: "Success", text: "Category deleted successfully!"}, 4000);
        } catch (error) {
            notify({group: "foo", title: "Error", text: "An error occurred while deleting the category."}, 2000);
            console.error(error);
        }
        onClose(); // Close modal after submission
    };

    if (!isOpen) return null;

    return (
        <div
            id="delete-Category-modal"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
            <div className="relative w-full max-w-3xl p-4 h-full md:h-auto">
                <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                    {/* Modal header */}
                    <div className="flex justify-between items-center pb-4 mb-4 border-b dark:border-gray-600">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Delete Category {/*item_id*/}
                        </h3>
                        <button
                            type="button"
                            className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                            onClick={handleClosing}
                        >
                            <svg
                                aria-hidden="true"
                                className="w-5 h-5"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    {/* Modal body */}
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4 mb-4 sm:grid-cols-2">
                            <span className="text-sm font-medium text-gray-900 text-black">
                                Are you sure you want to delete this category?
                            </span>
                        </div>
                        <div className="flex space-x-4">
                            <button
                                type="submit"
                                className="w-full sm:w-auto text-white bg-primary hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5"
                            >
                                Delete Category
                            </button>
                            <button
                                type="button"
                                onClick={handleClosing}
                                className="w-full sm:w-auto text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500"
                            >
                                Discard
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DeleteCategoryModal;
