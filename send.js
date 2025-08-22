  const aTag = document.querySelector('a');
  console.log(fColor);
  aTag.addEventListener('click', () => {
    var array = stepsInstructions.split(',');
    localStorage.setItem("pinsdata", pins);
    localStorage.setItem("data", array);
    localStorage.setItem("SIZE", SIZE);
    localStorage.setItem("framecolor", fColor);
    localStorage.setItem("pincovercolor", cColor);
    console.log(pins);
    console.log(array);
    console.log(SIZE);
    console.log(fColor);
    console.log(cColor);
  });