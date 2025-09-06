  const aTag = document.querySelector('a');
  console.log(fColor);
  aTag.addEventListener('click', () => {
    var array = stepsInstructions.split(',');
    var combined = (typeof NR_PINS !== 'undefined' ? NR_PINS : (pins && pins.length ? pins.length : '')) + ',' + stepsInstructions;
    localStorage.setItem("pinsdata", pins);
    localStorage.setItem("data", combined);
    localStorage.setItem("SIZE", SIZE);
    localStorage.setItem("framecolor", fColor);
    localStorage.setItem("pincovercolor", cColor);
    console.log(pins);
    console.log(combined);
    console.log(SIZE);
    console.log(fColor);
    console.log(cColor);
  });