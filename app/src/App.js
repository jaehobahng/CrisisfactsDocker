import './App.css';
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [data, setData] = useState([]);
  // const [requestFilter, setRequestFilter] = useState("All");
  const [requestFilter, setRequestFilter] = useState("Edenville Dam Fail 2020");
  const [dateFilter, setDateFilter] = useState("All");
  const [filteredData, setFilteredData] = useState([]);
  const [requestOptions, setRequestOptions] = useState([]);
  const [dateOptions, setDateOptions] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [originalData, setOriginalData] = useState([]);
  const [filteredOriginalData, setFilteredOriginalData] = useState([]);
  const [showOriginalData, setShowOriginalData] = useState(false); // Track visibility of original data
  const [includeUnanswerable, setIncludeUnanswerable] = useState("Exclude");

  // Fetch unique requests
  useEffect(() => {
    axios
      .get("http://localhost:5001/api/unique_requests")
      .then((response) => {
        if (Array.isArray(response.data)) {
          setRequestOptions(response.data); // Populate dropdown with all unique requests
        } else {
          console.error("Expected an array from /api/unique_requests, got:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching unique requests:", error);
      });
  }, []);

  // Fetching summary data
  useEffect(() => {
    axios
      .get("http://localhost:5001/api/summary", {
        params: {
          request: requestFilter !== "All" ? requestFilter : undefined,
        },
      })
      .then((response) => {
        const responseData = response.data;
        if (Array.isArray(responseData)) {
          setData(responseData);
        } else {
          console.error("Expected an array from /api/summary, got:", responseData);
        }
      })
      .catch((error) => {
        console.error("Error fetching summary data:", error);
      });
  
    // Fetching original data
    axios
      .get("http://localhost:5001/api/original", {
        params: {
          request: requestFilter !== "All" ? requestFilter : undefined,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data)) {
          setOriginalData(response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching original data:", error);
      });
  }, [requestFilter]);

  // Setting the date filter options based on the request filter
  useEffect(() => {
    const uniqueDatesForRequest = [
      ...new Set(data.filter(record => requestFilter === "All" || record.request === requestFilter).map(record => record.date))
    ];
    setDateOptions(uniqueDatesForRequest);
    setDateFilter("All"); // Reset date filter whenever the request filter changes
  }, [requestFilter, data]);

  // Filtering summary data
  useEffect(() => {
    let filtered = data;

    // Apply request filter
    if (requestFilter !== "All") {
      filtered = filtered.filter(record => record.request === requestFilter);
    }

    // Apply date filter
    if (dateFilter !== "All") {
      filtered = filtered.filter(record => record.date === dateFilter);
    }

    // Apply "unanswerable" filter
    if (includeUnanswerable === "Exclude") {
      filtered = filtered.filter(record => record.summary_xsum_detail !== "unanswerable");
    }

    setFilteredData(filtered);
  }, [requestFilter, dateFilter, includeUnanswerable, data]);

  // Filtering original data
  useEffect(() => {
    let filtered = originalData;

    // Apply request filter
    if (requestFilter !== "All") {
      filtered = filtered.filter(record => record.request === requestFilter);
    }

    // Apply date filter
    if (dateFilter !== "All") {
      filtered = filtered.filter(record => record.date === dateFilter);
    }

    setFilteredOriginalData(filtered);
  }, [requestFilter, dateFilter, originalData]);

  const handleRowClick = (record) => {
    // Set filtered original data based on the clicked row
    const filtered = originalData.filter(
      (originalRecord) =>
        originalRecord.request === record.request &&
        originalRecord.date === record.date &&
        originalRecord.question === record.question
    );
    setFilteredOriginalData(filtered);
    setShowOriginalData(true); // Show original data when a row is clicked
  };

  const handleBackToSummary = () => {
    setShowOriginalData(false); // Hide original data and return to summary table
  };

  return (
    <div>
      <h1>CrisisFACTS</h1>
      <p>Add description</p>

      {/* Conditionally render the appropriate table */}
      {!showOriginalData ? (
      <div>

        <div className="filter-container">
          <div className="filter-title">Filter Data</div>
          <div className="filter-row">
            <div className="filter-item">
              <label htmlFor="request">Filter by Event:</label>
              <select
                id="request"
                value={requestFilter}
                onChange={(e) => setRequestFilter(e.target.value)}
              >
                <option value="All">Select an Event</option>
                {requestOptions.sort().map((request, index) => (
                  <option key={index} value={request}>
                    {request}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="date">Filter by Event Date:</label>
              <select
                id="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                <option value="All">Select an Event Date</option>
                {dateOptions.sort().map((date, index) => (
                  <option key={index} value={date}>
                    {date}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <label htmlFor="rowsPerPage">Number of Facts:</label>
              <input
                type="number"
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Math.max(1, e.target.value))}
                min="1"
              />
            </div>

            <div className="filter-item">
                <label htmlFor="unanswerable-filter">Summary "unanswerable":</label>
                <select
                  id="unanswerable-filter"
                  value={includeUnanswerable}
                  onChange={(e) => setIncludeUnanswerable(e.target.value)}
                >
                  <option value="Include">Include</option>
                  <option value="Exclude">Exclude</option>
                </select>
              </div>

          </div>
        </div>

      
        <table className="summary-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Datetime</th>
                <th>Importance Score</th>
                <th>Question</th>
                <th>Summary</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan="6">No data available</td>
                </tr>
              ) : (
                filteredData.slice(0, rowsPerPage).map((record, index) => (
                  <tr key={record.id || index}>
                    <td>
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default link behavior
                          handleRowClick(record);
                        }}
                      >
                        {index + 1}
                      </a>
                    </td>
                    <td>{record.datetime}</td>
                    <td>{record.avg_importance.toFixed(4)}</td>
                    <td>{record.question}</td>
                    <td>{record.summary_xsum_detail}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div>
          
          <div className="filter-container2">
            <div className="sub-title2">Filtered Original Data</div>
            <div className="sub-title3"> Event: {filteredOriginalData[0]?.request || "No Request Available"}</div>
            <div className="sub-title3"> Question: {filteredOriginalData[0]?.question || "No Question Available"} ( {filteredOriginalData[0]?.date || "No Date Available"} ) </div>
            <div className="summary-text">Summary: {data.find(
                                                      (record) =>
                                                        record.request === filteredOriginalData[0]?.request &&
                                                        record.date === filteredOriginalData[0]?.date &&
                                                        record.question === filteredOriginalData[0]?.question
                                                    )?.summary_xsum_detail || "No Summary Available"}
            </div>
          </div>
          
          <br></br>

          <div className="button-table-container">

            <button onClick={handleBackToSummary}>Back to summary data</button>

            <table className="original-table">
              <thead>
                <tr>
                  <th>Datetime</th>
                  <th>Source</th>
                  <th>Text</th>
                  <th>Importance</th>
                </tr>
              </thead>
              <tbody>
                {filteredOriginalData.length === 0 ? (
                  <tr>
                    <td colSpan="5">No data available</td>
                  </tr>
                ) : (
                  filteredOriginalData.map((record, index) => (
                    <tr key={record.id || index}>
                      <td>{record.datetime}</td>
                      <td>{record.source}</td>
                      <td>{record.text}</td>
                      <td>{record.importance.toFixed(4)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;