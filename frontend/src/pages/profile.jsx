import React from "react";

const  profile = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 > profile</h1>
        <p >
          profile page 
        </p> 
      </div>
    </div>
  );
};


const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#1f99b5ff",
  },
  card: {
    background: "#e8e8e8ff",
    padding: "40px",
    width: "300px",
    
    textAlign: "center",

  },
 
 
};

export default profile;
