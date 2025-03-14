import React, {useState, useEffect, useCallback} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { notify } from 'notiwind';
import {adminGetAllProducts} from "../../../redux/action/productAction.js";
import AddProductModal from "./models/AddProductModal.jsx";
import UpdateProductModal from "./models/UpdateProductModal.jsx";
import {adminGetAllCategories} from "../../../redux/action/categoryAction.js";

const ProductCRUD = () => {
    const dispatch = useDispatch();
    const {products, topping_data, loading: productsLoading} = useSelector(state => state.products);
    const {categories, loading: categoriesLoading} = useSelector(state => state.categories);

    // const [loading, setLoading] = useState(true);
    // const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    // const [selectedProduct, setSelectedProduct] = useState(null);
    const [modatState, setModalState] = useState({
        isAddModalOpen: false,
        isUpdateModalOpen: false,
        selectedProductId: null,
    });

    const fetchCategories = async () => {
        await dispatch(adminGetAllCategories());
    }

    const fetchProducts = async () => {
        await dispatch(adminGetAllProducts());
    };

    useEffect(() => {
        fetchCategories();
        fetchProducts();
    }, []);

    const handleUpdateProductClick = (product_id) => {
        setModalState({ ...modatState, isUpdateModalOpen: true, selectedProductId: product_id });
    };

    const handleCloseUpdateModal = (product) => {
        setModalState({ ...modatState, isUpdateModalOpen: false, selectedProductId: null });
    };

    const handleDeleteProduct = async (id) => {
        try {
            await dispatch(deleteProduct(id));
            notify({ group: "foo", title: "Success", text: "Product deleted successfully!" }, 4000);
        } catch (error) {
            notify({ group: "foo", title: "Error", text: "An error occurred while deleting the category." }, 2000);
            console.error(error);
        }
    };

    const handleSearchProduct = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createProduct(form));
            notify({ group: "foo", title: "Success", text: "Product created successfully!" }, 4000);
            setForm({ name: '', description: '', type: '', team_id: '' });
        } catch (error) {
            notify({ group: "foo", title: "Error", text: "An error occurred while creating the category." }, 2000);
            console.error(error);
        }
    };

    return (
        <section className="p-3 sm:p-5 antialiased h-full w-full">
            <div className="mx-auto max-w-screen-2xl px-4 lg:px-12">
                <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
                    <div
                        className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
                        <div className="flex-1 flex items-center space-x-2">
                            <h5>
                                <span className="text-gray-500">All Products: </span>
                                <span className="dark:text-white">123456</span>
                            </h5>
                            <h5 className="text-gray-500 dark:text-gray-400 ml-1">1-100 (436)</h5>
                            <button type="button" className="group">
                                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
                                     className="h-4 w-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                     viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                          clipRule="evenodd"/>
                                </svg>
                                <span className="sr-only">More info</span>
                            </button>
                        </div>
                    </div>
                    <div
                        className="flex flex-col md:flex-row items-stretch md:items-center md:space-x-3 space-y-3 md:space-y-0 justify-between mx-4 py-4 border-t dark:border-gray-700">
                        {/* search bar */}
                        <div className="w-full md:w-1/2">

                            <form className="flex items-center" onSubmit={handleSearchProduct}>
                                <label htmlFor="simple-search" className="sr-only">Search</label>
                                <div className="relative w-full">
                                    <div
                                        className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                        <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400"
                                             fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                            <path fillRule="evenodd" clipRule="evenodd"
                                                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"/>
                                        </svg>
                                    </div>
                                    <input type="text" id="simple-search" placeholder="Search for Products" required
                                           className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"/>
                                </div>
                            </form>
                        </div>

                        {/* add button */}
                        <div
                            className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                            <button type="button" onClick={() => setModalState({ ...modatState, isAddModalOpen: true })}
                                    className="flex items-center justify-center text-white bg-primary hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary focus:outline-none dark:focus:ring-primary-800">
                                <svg className="h-3.5 w-3.5 mr-1.5 -ml-1" fill="currentColor" viewBox="0 0 20 20"
                                     xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path clipRule="evenodd" fillRule="evenodd"
                                          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"/>
                                </svg>
                                Add Product
                            </button>
                            <AddProductModal
                                isOpen={modatState.isAddModalOpen}
                                onClose={() => setModalState({ ...modatState, isAddModalOpen: false })}
                                categories={categories}
                                topping_data={topping_data}
                            />

                            {/* filter button */}
                            <button type="button"
                                    className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-600 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
                                <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
                                     className="h-4 w-4 mr-1.5 -ml-1 text-gray-400" viewBox="0 0 20 20"
                                     fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                                          clipRule="evenodd"/>
                                </svg>
                                Filter options
                                <svg className="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                                     xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path clipRule="evenodd" fillRule="evenodd"
                                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                                </svg>
                            </button>
                        </div>

                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                            <thead
                                className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="p-4">
                                    <div className="flex items-center">
                                        <input id="checkbox-all" type="checkbox"
                                               className="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                        <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
                                    </div>
                                </th>
                                <th scope="col" className="p-4">Name</th>
                                <th scope="col" className="p-4">Description</th>
                                <th scope="col" className="p-4">Category Name</th>
                                <th scope="col" className="p-4">Price</th>
                            </tr>
                            </thead>
                            <tbody >
                                {products?.map((category, categoryIndex) => (
                                    category.product_list.map((item, productIndex) => (
                                        <tr key={`${categoryIndex}-${productIndex}`}
                                            className="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700">
                                            <td className="p-4 w-4">
                                                <div className="flex items-center">
                                                    <input id={`checkbox-table-search-${categoryIndex}-${productIndex}`} type="checkbox"
                                                           className="w-4 h-4 text-primary-600 bg-gray-100 rounded border-gray-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                                    <label htmlFor={`checkbox-table-search-${categoryIndex}-${productIndex}`}
                                                           className="sr-only">checkbox</label>
                                                </div>
                                            </td>
                                            <td className="p-4">{item.product_name}</td>
                                            <td className="p-4">{item.product_description}</td>
                                            <td className="p-4">{category.category_name}</td>
                                            <td className="p-4">{item.product_price}</td>
                                            <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                {/* update button */}
                                                <div className="flex items-center space-x-3 justify-end">
                                                    <button type="button" onClick={() => handleUpdateProductClick(item.product_id)}
                                                            className="py-2 px-3 flex items-center text-sm font-medium text-center text-white bg-primary rounded-lg hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary dark:focus:ring-primary-800">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"
                                                             viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path
                                                                d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"/>
                                                            <path fillRule="evenodd"
                                                                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                                                                  clipRule="evenodd"/>
                                                        </svg>
                                                    </button>
                                                {/* delete button */}
                                                    <button type="button" onClick={() => handleDeleteProduct(item.id)}
                                                            className="flex items-center text-red-700 hover:text-white border border-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2 text-center dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-900">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1"
                                                             viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                            <path fillRule="evenodd"
                                                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                                  clipRule="evenodd"/>
                                                        </svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ))}
                                {products?.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center">No data available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <nav
                        className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4"
                        aria-label="Table navigation">
                        <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                          Showing
                          <span className="font-semibold text-gray-900 dark:text-white">1-10</span>
                          of
                          <span className="font-semibold text-gray-900 dark:text-white">1000</span>
                        </span>
                        <ul className="inline-flex items-stretch -space-x-px">
                            <li>
                                <a href="#"
                                   className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                    <span className="sr-only">Previous</span>
                                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
                            </li>
                            <li>
                                <a href="#" aria-current="page"
                                   className="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-blue-600 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">4</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">5</a>
                            </li>
                            <li>
                                <a href="#"
                                   className="flex items-center justify-center h-full py-1.5 px-3 -ml-px text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                    <span className="sr-only">Next</span>
                                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"
                                         xmlns="http://www.w3.org/2000/svg">
                                        <path fillRule="evenodd"
                                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                              clipRule="evenodd"/>
                                    </svg>
                                </a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
            {modatState.isUpdateModalOpen && (
                <UpdateProductModal
                    isOpen={modatState.isUpdateModalOpen}
                    onClose={handleCloseUpdateModal}
                    selectedProductId={modatState.selectedProductId}
                    categories={categories}
                    topping_data={topping_data}
                />
            )}
        </section>
    );
};


export default ProductCRUD;
