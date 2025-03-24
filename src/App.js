import React, { useEffect, useState } from "react";
import axios from "axios";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import classnames from "classnames";
import Button from "@mui/material/Button";
ModuleRegistry.registerModules([AllCommunityModule]);

const AppComponent = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]);
  const [updatedRows, setUpdatedRows] = useState([]);
  const [colDefs, setColDefs] = useState([
    { field: "id", flex: 1 ,checkboxSelection: true,headerCheckboxSelection: true },
    { field: "first_name", flex: 1, editable: true },
    { field: "last_name", flex: 1, editable: true },
    { field: "age", flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      cellRenderer: (params) => {
        return (
          <div>
            <Button
              variant="contained"
              style={{ marginRight: "10px", backgroundColor: "blue" }}
              onClick={() => handleUpdate(params.data)}
            >
              Update
            </Button>
            <Button
              variant="contained"
              style={{ backgroundColor: "red" }}
              onClick={() => handleDelete(params.data)}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ]);

  const handleUpdate = async (data) => {
    console.log(data)
    const response = await axios.put(
      `http://localhost:5000/api/v1/people/update/${data.id}`,
      {
        first_name: data.first_name,
        last_name: data.last_name,
        age: data.id,
      }
    );
    fetchPeople();
  };

  const handleDelete = async (data) => {
    const response = await axios.delete(
      `http://localhost:5000/api/v1/people/delete/${data.id}`
    );
    fetchPeople();
  };

  const inserData = async()=>{
    const response = await axios.post(`http://localhost:5000/api/v1/people/insert`);
    fetchPeople();

  }
  const bulkDelete = async () => {
    if (selectedRows.length === 0) {
      alert("Please select records to delete.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/api/v1/people/bulkDelete", {
        ids: selectedRows.map((row) => row.id),
      });
      fetchPeople();
    } catch (err) {
      console.error("Error deleting records:", err);
    }
  };

  const onCellValueChanged = (params) => {
    const updatedRow = params.data;
  
    setUpdatedRows((prevRows) => {
      const existingIndex = prevRows.findIndex(row => row.id === updatedRow.id);
      if (existingIndex !== -1) {
        prevRows[existingIndex] = updatedRow;
        return [...prevRows];
      } else {
        return [...prevRows, updatedRow];
      }
    });
  };

  const handleBulkUpdate = async () => {
    if (updatedRows.length === 0) {
      alert("No changes detected.");
      return;
    }
  
    try {
      await axios.post("http://localhost:5000/api/v1/people/bulkUpdate", {
        records: updatedRows,
      });
  
      setUpdatedRows([]); // Clear the modified rows after update
     await setTimeout(() => {
        fetchPeople();
      }, 5000);
      // fetchPeople(); // Refresh data
    } catch (error) {
      console.error("Error updating records:", error);
    }
  };

  const gridStyle = {
    height: 500,
    maxHeight: "100vh",
    minHeight: "200px",
    width: "100%",
    marginleft: "10px",
  };

  const styles = () => ({
    grid: {
      backgroundColor: "#F7F5F5",
      width: "100%",
      marginleft: "10px",
    },
  });

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/v1/people/getPeoples"
      );
      setPeople(response.data.records.rows);
      console.log(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching people data:", err);
      setError("Failed to fetch data.");
      setLoading(false);
    }
  };
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <>
      <div style={{ padding: "15px" }}>
        <Button variant="contained" onClick={inserData}>Bulk Insert Data</Button>
        <Button style={{marginLeft:"70%"}} variant="contained" onClick={handleBulkUpdate}>Bulk Update</Button>
        <Button style={{marginLeft:"15px"}} variant="contained" onClick={bulkDelete}>Bulk Delete</Button>
      </div>
      <div
        style={gridStyle}
        className={classnames(styles.grid, "ag-theme-balham")}
      >
        <AgGridReact
          rowData={people}
          columnDefs={colDefs}
          pagination={false}
          rowSelection="multiple"
          onSelectionChanged={(event) => setSelectedRows(event.api.getSelectedRows())}
          onCellValueChanged={onCellValueChanged}
        ></AgGridReact>
      </div>
    </>
  );
  
};
export default AppComponent;
