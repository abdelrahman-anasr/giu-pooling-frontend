/* eslint-disable no-unused-vars */

import React from "react";
import { useQuery, gql } from "@apollo/client";
import "../../styles/Common.css";
const GET_CARS = gql`
  query {
    cars {
      id
      DriverId
      carModel
      carModelYear
      seats
    }
  }
`;

const CarManager = () => {
  const { loading, error, data } = useQuery(GET_CARS);

  if (loading) return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading car records...</p>
    </div>
  );
  
  if (error) return (
    <div className="error-container" style={{ padding: '20px', textAlign: 'center', color: '#D52029' }}>
      <p>Error loading cars: {error.message}</p>
      <button className="btn black" onClick={() => window.location.reload()}>Try Again</button>
    </div>
  );

  return (
    <div className="data-box">
      <div className="section-title" style={{ marginBottom: 16 }}>Car Records</div>
      
      {!data || !data.cars || data.cars.length === 0 ? (
        <div className="empty-state">
          <p style={{ textAlign: "center", color: "#000000", padding: "40px 0" }}>No cars found in the database.</p>
        </div>
      ) : (
        <div className="cars-container" style={{ maxHeight: "600px", overflowY: "auto" }}>
          {data.cars.map((car) => (
            <div key={car.id} className="car-card" style={{
              border: "1px solid #000000",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "16px",
              backgroundColor: "#FFFFFF",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}>
              <div className="car-header" style={{
                marginBottom: "16px",
                borderBottom: "1px solid #EDEDED",
                paddingBottom: "12px"
              }}>
                <h3 style={{ 
                  fontSize: "18px", 
                  fontWeight: "600", 
                  margin: "0 0 4px 0",
                  color: "#000000"
                }}>
                  {car.carModel} ({car.carModelYear})
                </h3>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <span className="status-badge" style={{
                      backgroundColor: "#FFD281",
                      color: "#000000",
                      display: "inline-block",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "600"
                    }}>Active</span>
                  </div>
                  <small style={{ color: "#000000" }}>ID: {car.id.substring(0, 8)}</small>
                </div>
              </div>
              
              <div className="car-details" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px"
              }}>
                <div className="detail-item" style={{
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <span className="detail-label" style={{
                    fontSize: "13px",
                    color: "#000000",
                    marginBottom: "4px",
                    fontWeight: "500"
                  }}>Driver ID:</span>
                  <span className="detail-value" style={{
                    fontSize: "15px",
                    color: "#000000"
                  }}>{car.DriverId}</span>
                </div>
                
                <div className="detail-item" style={{
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <span className="detail-label" style={{
                    fontSize: "13px",
                    color: "#000000",
                    marginBottom: "4px",
                    fontWeight: "500"
                  }}>Seats:</span>
                  <span className="detail-value" style={{
                    fontSize: "15px",
                    color: "#000000"
                  }}>{car.seats}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style>
        {`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 0;
        }
        .loading-spinner {
          border: 4px solid #EDEDED;
          border-top: 4px solid #000000;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .cars-container {
          scrollbar-width: thin;
          scrollbar-color: #EDEDED transparent;
        }
        .cars-container::-webkit-scrollbar {
          width: 8px;
        }
        .cars-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .cars-container::-webkit-scrollbar-thumb {
          background-color: #EDEDED;
          border-radius: 4px;
        }
        .btn.black {
          background-color: #000000;
          color: #FFFFFF;
          border: none;
          border-radius: 25px;
          padding: 10px 24px;
          font-weight: 500;
          cursor: pointer;
          margin-top: 15px;
        }
        `}
      </style>
    </div>
  );
};

export default CarManager;