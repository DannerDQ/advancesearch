"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const $searchButton = $("#searchButton");
const $searchInput = $("#search");
// const $searchError = $('#searchError');
const $fileTypeContainer = $(".fileTypeContainer");
const $fileType = $("#fileTypeList");
// const $fileTypeError = $('#fileTypeError');
const $angle_down = $(".fa-angle-down");
const $texto = $("#texto");
const $$inputTypeRadio = $$('input[type="radio"]');
const $b = $(".b");
const $bodyDistribution = $(".bodyDistribution");
const $results = $(".results");
const $loaderContainer = $(".loaderContainer");
const click = new CustomEvent("click");

const request = {
  search: "",
  fileType: "",
  fileExtension: "",
};

const percentEncoding = {
  " ": "%20",
  "!": "%21",
  "#": "%23",
  $: "%24",
  "%": "%25",
  "&": "%26",
  "'": "%27",
  "(": "%28",
  ")": "%29",
  "*": "%2A",
  "+": "%2B",
  ",": "%2C",
  "/": "%2F",
  ":": "%3A",
  ";": "%3B",
  "=": "%3D",
  "?": "%3F",
  "@": "%40",
  "[": "%5B",
  "]": "%5D",
};

const percentEncodingKeys = Object.keys(percentEncoding);

function getParentElement(element) {
  return element.parentElement;
}

$fileTypeContainer.firstElementChild.addEventListener("click", () => {
  $angle_down.classList.toggle("rotate180deg");
  $fileType.classList.toggle("invisible");
});

$texto.firstElementChild.addEventListener("click", (event) => {
  let element = event.target;
  if (element.tagName !== "SPAN") {
    element = element.parentElement;
    element.querySelector(".fa-angle-down").classList.toggle("rotate180deg");
    element.nextElementSibling.classList.toggle("invisible");
  } else {
    element.querySelector(".fa-angle-down").classList.toggle("rotate180deg");
    element.nextElementSibling.classList.toggle("invisible");
  }
});

$$inputTypeRadio.forEach(($input) => {
  const label = $input.parentElement;
  label.addEventListener("mouseup", () => {
    $b.textContent = label.textContent;
    request.fileType = label.parentElement.parentElement.id;
    request.fileExtension = $input.value;
    label.parentElement.previousElementSibling.dispatchEvent(click);
    $fileTypeContainer.firstElementChild.dispatchEvent(click);
  });
});

$searchInput.addEventListener("keydown", (e) => {
  if (e.keyCode === 13) $searchButton.dispatchEvent(click);
});

$searchButton.addEventListener("click", () => {
  if (request.fileType === "" || /^ *$/.test($searchInput.value)) {
    if (request.fileType === "") {
      const error = document.createElement("i");
      error.className = "fa-solid fa-circle-exclamation";
      error.id = "icon-error";
      $b.appendChild(error);
      setTimeout(() => error.remove(), 800);
    }
    if (/^ *$/.test($searchInput.value)) {
      $searchInput.focus();
      $(".input").style.border = "2px solid #891722";
      setTimeout(() => ($(".input").style = ""), 500);
      $searchInput.value = "";
    }
  } else {
    const children = $results.children;
    for (let child of [...children]) {
      if (child.className === "resultContainer") $results.removeChild(child);
    }
    $loaderContainer.classList.replace("invisible", "loaderContainerInit");
    const $spanList = $loaderContainer.querySelectorAll("span");
    $spanList.forEach(($span) => $span.classList.add("loader"));
    if ($bodyDistribution.href.includes("index"))
      $bodyDistribution.href = "/static/CSS/results.css";
    request.search = "";
    for (let i of $searchInput.value.trim()) {
      if (percentEncodingKeys.includes(i)) request.search += percentEncoding[i];
      else request.search += i;
    }

    const search = request.search;
    const extension = request.fileExtension;
    const fileType = request.fileType;
    const url = `/__/${fileType}/${search}/${extension}/0`;
    axios(url)
      .then((res) => {
        const fragment = document.createDocumentFragment();
        let results = res.data.results;
        for (let i in results) {
          const newResult = document.importNode($("#newResult").content, true);
          const title = newResult.querySelector("a");
          const description = newResult.querySelector("p");

          title.textContent = results[i].title;
          title.href = results[i].link;
          description.textContent = results[i].description;
          fragment.appendChild(newResult);
        }
        $spanList.forEach(($span) => $span.classList.remove("loader"));
        $loaderContainer.classList.replace("loaderContainerInit", "invisible");
        $results.appendChild(fragment);
      })
      .catch((err) => console.log(err));
  }
});
