const randomFourNumber = () => {
  // make random 4 Number
  return (Math.floor(Math.random() * 9000) + 1000).toString();
};

module.exports = randomFourNumber;
