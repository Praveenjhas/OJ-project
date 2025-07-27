// src/pages/ProblemPage.jsx
import React from "react";
import FilterSidebar from "../src/components/problems/FilterSidebar.jsx";
import ProblemTable from "../src/components/problems/ProblemTable.jsx";

const ProblemPage = () => {
  return (
    <div className="flex">
      <FilterSidebar />
      <ProblemTable />
    </div>
  );
};

export default ProblemPage;
