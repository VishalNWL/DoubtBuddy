import React from "react";
import nodataimg from "../../assets/nodata.svg";

function NoData({message='No doubts available'}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <img
        src={nodataimg}
        alt="No data available"
        className="w-48 h-48 mb-4 opacity-80"
      />
      <p className="text-gray-500 text-lg font-medium">
        {message}
      </p>
    </div>
  );
}

export default NoData;
