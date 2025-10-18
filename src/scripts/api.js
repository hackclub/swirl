// Data for Swirl using Unified YSWS Database API
fetch("https://api2.hackclub.com/v0.1/Unified%20YSWS%20Projects%20DB/YSWS%20Programs/", { method: "GET" })
    .then(response => response.json())
    .then(data => {
        const swirlData = data.find(item => item.fields.Name === 'Swirl');
        document.getElementById('swirl-ships').textContent = swirlData ? swirlData.fields['Unweighted–Total']: 'Data Not Available';
    })
    .catch(error => {
        console.error("Error Fetching Data From API:", error);
        document.getElementById('swirl-ships').textContent = "Error fetching data.";
    });