export function formatVietnameseCurrency(amount, showD = true) {
    if (isNaN(amount)) {
        throw new Error("Invalid number");
    }

    // Format the currency
    const formattedCurrency = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        currencyDisplay: showD ? 'symbol' : 'code' // Use 'đ' if showD is true, otherwise use 'VND'
    }).format(amount);

    // Remove the 'VND' text if showD is false
    return showD ? formattedCurrency : formattedCurrency.replace('VND', '');
};
