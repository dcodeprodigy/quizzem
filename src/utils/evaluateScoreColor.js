const evalScoreColor = (score) => {
    if (score >= 70) {
      return "bg-green-100 text-green-700";
    } else if (score >= 50 && score < 70) {
      return "bg-yellow-100 text-yellow-700";
    } else {
      return "bg-red-100 text-red-700";
    }
  };

  export default evalScoreColor