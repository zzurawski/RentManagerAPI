function Navbar() {
    let dbid = localStorage.getItem('rm_dbid') || process.env.RM_CORPORATE_ID || "companyCode";
  return (`
    <nav>
        <a href="../frontend/index.html">Home</a> 
        <a href="./pages/report.html">Report</a> 
        <a href="./pages/tenants.html">Tenants</a>
        <a href="./pages/letterTemplates.html">Letter Templates</a>
        <span id="dbid-info">logged into: ${dbid}</span>
    </nav>
    `
  );}

export default Navbar;