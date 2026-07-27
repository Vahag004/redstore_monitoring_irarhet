import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import HomeContent from "./components/HomeContent";
import ListsTable from "./components/ListsTable";
import ListContent from "./components/ListContent";
import ShopsTable from "./components/ShopsTable";
import ShopDetailContent from "./components/ShopDetailContent";

function App() {
    return (
        <>
            <Navbar />
            <Routes>
                <Route path="/" element={<HomeContent />} />
                <Route path="/lists" element={<ListsTable />} />
                <Route path="/lists/:id" element={<ListContent />} />
                <Route path="/shops" element={<ShopsTable />} />
                <Route path="/shops/:id" element={<ShopDetailContent />} />
            </Routes>
        </>
    );
}

export default App;
