import React from 'react';
// lists approved addresses

function ApproveList({ approveTx }) {
  if (approveTx == null) return "";
  return (
    <>
      {approveTx && approveTx.map((approves, index) => (
        <div key={index} className="alert alert-dismissible alert-info">
          <div>
            <strong>Approved Spender</strong>{" "}{approves.spender}
          </div>
          <div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ApproveList