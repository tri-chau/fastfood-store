import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    adminGetAllProducts,
    adminGetProduct,
    adminUpdateProduct,
    CreateProduct
} from "../../../../redux/action/productAction.js";
import {notify} from "../../../../layouts/Notification/notify.jsx";

const UpdateProductModal = React.memo(({isOpen, onClose, selectedProductId, categories, topping_data}) => {
    const dispatch = useDispatch();
    const {product, loading} = useSelector((state) => state.product);

    const [form, setForm] = useState({
        id: "",
        name: "",
        description: "",
        status: "",
        isTopping: "",
        price: "",
        cost: "",
        up_m_price: "",
        up_l_price: "",
        priority: "",
        categoryId: [],
        toppingId: [],
        thumbnailImage: "",
        productDetailImages: [],
    });

    useEffect(() => {
        const getProduct = async () => {
            await dispatch(adminGetProduct(selectedProductId));
        };

        getProduct();
    }, [selectedProductId]);


    useEffect(() => {
        console.log("product", product);
        if (product) {
            setForm({
                id: product.id || "",
                name: product.name || "",
                description: product.description || "",
                status: product.status || "inactive",
                isTopping: product.is_topping?.toString() || "0",
                price: product.price || 1000,
                cost: product.cost || 1000,
                up_m_price: product.up_m_price || 1000,
                up_l_price: product.up_l_price || 1000,
                priority: product.priority || 0,
                categoryId: product.categories_id || [],
                toppingId: product.toppings_id || [],
                // thumbnailImage: product.thumbnailImage,
                // productDetailImages: product.productDetailImages,
            });
        }
    }, [product]);

    const toppingList = topping_data?.[0]?.topping_list;

    const handleInputChange = (e) => {
        const {id, value, name, files, checked, dataset} = e.target;
        if (name === "thumbnailImage") {
            setForm((prevForm) => ({...prevForm, [name]: files[0]}));
        } else if (name === "productDetailImages") {
            const fileArray = Array.from(files);
            setForm((prevForm) => ({...prevForm, [name]: fileArray}));
        } else if (name === "categoryId") {
            setForm((prevForm) => {
                const newCategoryId = checked ? [...prevForm.categoryId, value] : prevForm.categoryId.filter((id) => id !== value);
                return {...prevForm, categoryId: newCategoryId};
            });
        } else if (name === "toppingId") {
            setForm((prevForm) => {
                const topping = toppingList.find((t) => t.product_id.toString() === value); // Find topping object

                if (!topping) return prevForm; // Prevent errors

                const newToppingId = checked
                    ? [...prevForm.toppingId, {topping_id: topping.product_id, extra_price: 0}]
                    : prevForm.toppingId.filter((t) => t.topping_id !== topping.product_id);

                return {...prevForm, toppingId: newToppingId};
            });
        } else if (name === "extra_price" && dataset.toppingid) {
            setForm((prevForm) => {
                const toppingId = dataset.toppingid;
                const newToppingList = prevForm.toppingId.map(
                    (topping) => topping.topping_id === toppingId ? {...topping, extra_price: Number(value)} : topping);

                return {...prevForm, toppingId: newToppingList};
            });
        } else {
            setForm((prevForm) => ({...prevForm, [name]: value}));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // update: create a form data
        const formData = new FormData();

        // formData can't be consoled log
        formData.append("name", form.name);
        formData.append("description", form.description);
        formData.append("status", form.status);
        formData.append("price", form.price);
        formData.append("cost", form.cost);
        formData.append("up_m_price", form.up_m_price);
        formData.append("up_l_price", form.up_l_price);
        formData.append("is_topping", form.isTopping);
        formData.append("priority", form.priority);

        // Append multiple categories
        if (form.categoryId) {
            form.categoryId.forEach((categoryId) => {
                formData.append('categories_id[]', categoryId);
            });
        }

        if (form.toppingId) {
            form.toppingId.forEach((toppingId) => {
                const extraPrice = form.toppingId.find((topping) => topping.id === toppingId)?.extra_price || 0;

                formData.append('toppings_id[]', JSON.stringify({
                    toppingId,
                }));
            });
        }

        if(form.thumbnailImage){
            formData.append('thumbnailImage', form.thumbnailImage);
        }

        // Append multiple files
        if (form.productDetailImages) {
            form.productDetailImages.forEach((file) => {
                formData.append('productDetailImages[]', file);
            });
        }
        // for (let [key, value] of formData.entries()) {
        //     console.log(`${key}: ${value}`);
        // }

        try {
            await dispatch(adminUpdateProduct(form.id, formData));

            notify('success', 'Product updated successfully');

            setForm({
                name: '',
                description: '',
                status: 'inactive',
                isTopping: "0",
                price: 1000,
                cost: 1000,
                up_m_price: 1000,
                up_l_price: 1000,
                priority: 0,
                categoryId: [],
                toppingId: [],
                thumbnailImage: '',
                productDetailImages: []
            });

            // Fetch the updated product list
            await dispatch(adminGetAllProducts());
        } catch (error) {
            notify('error', 'Failed to create product');
        }
        onClose(); // Close modal after submission
    };

    if (!isOpen) return null;

    if (loading) return <div>Loading...</div>;

    return (<div
        id="create-Category-modal"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="relative w-full max-w-6xl p-4 h-full md:h-auto">
            <div className="relative p-4 bg-white rounded-lg shadow dark:bg-gray-800">
                {/* Modal header */}
                <div className="flex justify-between items-center pb-4 mb-4 border-b dark:border-gray-600">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Add Product
                    </h3>
                    <button
                        type="button"
                        className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg p-1.5 dark:hover:bg-gray-600 dark:hover:text-white"
                        onClick={onClose}>
                        <svg aria-hidden="true" className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"
                             xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"/>
                        </svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                </div>
                {/* Modal body */}
                <form onSubmit={handleSubmit} encType='multipart/form-data'>
                    <div className="grid gap-4 mb-4 sm:grid-cols-4">

                        {/* name */}
                        <div>
                            <label htmlFor="name"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={form.name}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Product Name"
                                required
                            />
                        </div>

                        {/* description */}
                        <div>
                            <label htmlFor="description"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Description
                            </label>
                            <input
                                type="text"
                                id="description"
                                name="description"
                                value={form.description}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Product Description"
                            />
                        </div>

                        {/* status */}
                        <div>
                            <label htmlFor="status"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Status
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="active"
                                        checked={form.status === "active"}
                                        onChange={handleInputChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                    <label htmlFor="active"
                                           className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Active</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="status"
                                        value="inactive"
                                        checked={form.status === "inactive"}
                                        onChange={handleInputChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                    <label htmlFor="inactive"
                                           className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Inactive</label>
                                </div>
                            </div>
                        </div>

                        {/* is topping */}
                        <div>
                            <label htmlFor="isTopping"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Is Topping
                            </label>
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="isTopping"
                                        value="1"
                                        checked={form.isTopping === "1"}
                                        onChange={handleInputChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        required
                                    />
                                    <label htmlFor="active"
                                           className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Is
                                        Topping</label>
                                </div>
                                <div className="flex items-center">
                                    <input
                                        type="radio"
                                        name="isTopping"
                                        value="0"
                                        checked={form.isTopping === "0"}
                                        onChange={handleInputChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                    <label htmlFor="none"
                                           className="ml-2 text-sm font-medium text-gray-900 dark:text-white">Not a
                                        Topping</label>
                                </div>
                            </div>
                        </div>

                        {/* cost */}
                        <div>
                            <label htmlFor="cost"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Cost
                            </label>
                            <input
                                type="number"
                                id="cost"
                                name="cost"
                                value={form.cost}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Product Cost"
                                min={0}
                                required
                            />
                        </div>

                        {/* price */}
                        <div>
                            <label htmlFor="price"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Price
                            </label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={form.price}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Product Price"
                                min={0}
                                required
                            />
                        </div>

                        {/* M price */}
                        <div>
                            <label htmlFor="up_m_price"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Up M Price
                            </label>
                            <input
                                type="number"
                                id="up_m_price"
                                name="up_m_price"
                                value={form.up_m_price}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Medium Price"
                                min={0}
                            />
                        </div>

                        {/* L price */}
                        <div>
                            <label htmlFor="up_l_price"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Up L Price
                            </label>
                            <input
                                type="number"
                                id="up_l_price"
                                name="up_l_price"
                                value={form.up_l_price}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Large Price"
                                min={0}
                            />
                        </div>

                        {/* Category Id */}
                        <div>
                            <label htmlFor="categoryId"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Category Name
                            </label>
                            <div id="categoryId"
                                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {form.isTopping === "1" ? (<div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="category_topping"
                                        name="categoryId"
                                        value="topping"
                                        checked={true}
                                        readOnly
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                    <label htmlFor="category_topping"
                                           className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Topping
                                    </label>
                                </div>) : (categories.map((category) => (
                                    <div key={category.id} className="flex items-center mb-2">
                                        <input
                                            type="checkbox"
                                            id={`category_${category.id}`}
                                            name="categoryId"
                                            value={category.id}
                                            checked={form.categoryId?.includes(category.id)}
                                            onChange={handleInputChange}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                        <label htmlFor={`category_${category.id}`}
                                               className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                            {category.name}
                                        </label>
                                    </div>)))}
                            </div>
                        </div>

                        {/* Topping Id */}
                        <div>
                            <label htmlFor="toppingId"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Topping Name
                            </label>
                            <div id="toppingId"
                                 className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                                {form.isTopping === "1" ? (<div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="category_topping"
                                        name="categoryId"
                                        value="topping"
                                        checked={true}
                                        readOnly
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    />
                                    <label htmlFor="category_topping"
                                           className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Topping
                                    </label>
                                </div>) : (toppingList?.map((topping) => (
                                    <div key={topping.product_id} className="flex flex-col items-start">
                                        <div className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                id={`topping_${topping.product_id}`}
                                                name="toppingId"
                                                value={topping.product_id}
                                                checked={form.toppingId?.some(t => t.topping_id === topping.product_id)}
                                                onChange={handleInputChange}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            />
                                            <label htmlFor={`topping_${topping.product_id}`}
                                                   className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                                {topping.product_name}
                                            </label>
                                        </div>
                                        {form.toppingId?.some(t => t.topping_id === topping.product_id) && (<input
                                            type="number"
                                            placeholder="Price with product"
                                            // id={`extra_price_${topping.product_id}`}
                                            name="extra_price"
                                            data-toppingid={topping.product_id}  // Attach topping ID
                                            value={form.toppingId.find((topping_data) => topping_data.topping_id === topping.product_id)?.extra_price}
                                            onChange={handleInputChange}
                                            className="mb-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            min={0}
                                        />)}
                                    </div>)))}
                            </div>
                        </div>

                        {/* image */}
                        <div>
                            <label htmlFor="image"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Thumbnail Image
                            </label>
                            <input
                                type="file"
                                id="thumbnailImage"
                                name="thumbnailImage"
                                onChange={handleInputChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            />
                        </div>

                        {/* folder product detail image */}
                        <div>
                            <label htmlFor="productDetailImages"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Product Detail Image
                            </label>
                            <input
                                type="file"
                                id="productDetailImages"
                                name="productDetailImages"
                                multiple
                                onChange={handleInputChange}
                                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
                            />
                        </div>

                        {/* priority */}
                        <div>
                            <label htmlFor="priority"
                                   className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                Priority (from 0 to 10)
                            </label>
                            <input
                                type="number"
                                id="priority"
                                name="priority"
                                value={form.priority}
                                onChange={handleInputChange}
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                placeholder="Priority"
                                min={0} step={1} max={10}
                            />
                        </div>

                    </div>
                    <div className="flex space-x-4 justify-end">
                        <button type="button" onClick={onClose}
                                className="w-full sm:w-auto text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500">
                            Discard
                        </button>
                        <button type="submit"
                                className="w-full sm:w-auto text-white bg-primary hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5">
                            Update Product
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>);
});

export default UpdateProductModal;
