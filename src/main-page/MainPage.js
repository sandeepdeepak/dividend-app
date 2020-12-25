import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import './MainPage.css';
import { TabMenu } from 'primereact/tabmenu';
import { Accordion, AccordionTab } from 'primereact/accordion';

import axios from 'axios';

const MainPage = () => {
    const [stocks, setStocks] = useState([]);
    const [dividends, setDivivdends] = useState([]);
    const [indexes, setIndexes] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState('S&P BSE SENSEX');
    const [items, setItems] = useState([
        { label: 'All' },
        { label: 'January' },
        { label: 'February' },
        { label: 'March' },
        { label: 'April' },
        { label: 'May' },
        { label: 'June' },
        { label: 'July' },
        { label: 'August' },
        { label: 'September' },
        { label: 'October' },
        { label: 'November' },
        { label: 'December' }
    ]);
    const [activeTab, setActiveTab] = useState(items[0]);
    const [activeAccIndex, setActiveAccIndex] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const shareDividends = (stocks, month = 'All') => {
        stocks.map(stock => {
            axios.get(`https://api.bseindia.com/BseIndiaAPI/api/CorporateAction/w?scripcode=${stock.Symbol}`)
                .then(res => {
                    stock.dividends = res.data.Table;
                    if (month !== 'All') {
                        stock.dividends = stock.dividends.filter((dividend) => dividend.BCRD_from.includes(month))
                    }
                    setDivivdends(res.data.Table);
                    // stock.dividends = res.data.Table;
                })
        });
    }

    const getIndexShares = (selectedIndex = 'S&P BSE SENSEX') => {
        axios.get(`https://api.bseindia.com/BseIndiaAPI/api/GetStkCurrMain/w?ddlVal1=Index&ddlVal2=${encodeURIComponent(selectedIndex)}&flag=Equity&m=0&pgN=1`)
            .then(res => {
                setStocks(res.data.sort(function (a, b) { return a.Price - b.Price }));
                shareDividends(res.data);
            })
    }

    const fetchIndexes = () => {
        axios.get(`https://api.bseindia.com/BseIndiaAPI/api/BindDDLEQ/w?flag=index`)
            .then(res => {
                let indexes = res.data.map((index) => index.Symbol)
                setIndexes(indexes);
            })
    }

    useEffect(() => {
        if (!isInitialized) {
            fetchIndexes();
            setIsInitialized(true);
            getIndexShares();
        }
    }, [getIndexShares]);


    const amountTemplate = (rowData) => {
        return <div>Rs. {rowData.Amount}</div>;
    }

    const filterMonthDividend = (e) => {
        setActiveTab(e.value);
        shareDividends(stocks, e.value.label.slice(0, 3));
    }

    const fetchSelectedIndexResult = (e) => {
        setStocks([]);
        setActiveAccIndex(null);
        setSelectedIndex(e.value);
        getIndexShares(e.value)
    }

    return (
        <div>
            <div className="m-md-5">
                <Dropdown value={selectedIndex} options={indexes} onChange={(e) => { fetchSelectedIndexResult(e) }} placeholder="Select Index" className="w-md-25 ml-2 mt-2" />
                <TabMenu model={items} activeItem={activeTab} onTabChange={(e) => filterMonthDividend(e)} />
                <Accordion className="accordion-custom mt-2" activeIndex={activeAccIndex}>
                    {stocks?.map((stock) => {
                        return <AccordionTab key={stock.ScripName}
                            disabled={!stock?.dividends?.length}
                            header={<React.Fragment><span>{stock?.LongName}</span><span> ({stock?.ScripName}) (Price:{stock?.Price})</span></React.Fragment>}>
                            <DataTable value={stock?.dividends}>
                                <Column field="purpose_name" header="Purpose"></Column>
                                <Column field="Amount" header="Amount" body={amountTemplate} className="amount-column"></Column>
                                <Column field="BCRD_from" header="Date"></Column>
                            </DataTable>
                        </AccordionTab>
                    })}
                </Accordion>
            </div>
        </div>
    );
}

export default MainPage