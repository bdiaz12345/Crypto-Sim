const rootReducer = (state = [], action) => {
    if (action.type === "onBuy") {
        return [...state, action.payload];
    }
    return state;
}

export default rootReducer;