import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getDatabase,
  ref,
  push,
  onValue,
  remove,
  update,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js";

const appSettings = {
  databaseURL:
    "https://playground-be10f-default-rtdb.europe-west1.firebasedatabase.app/",
};

const app = initializeApp(appSettings);
const database = getDatabase(app);
const shoppingListInDB = ref(database, "shoppingList");

const inputFieldEl = document.getElementById("input-field");
const addButtonEl = document.getElementById("add-button");
const categoriesEl = document.getElementById("categories");

addButtonEl.addEventListener("click", function () {
  let inputValue = inputFieldEl.value.trim();

  if (inputValue) {
    push(shoppingListInDB, { name: inputValue, category: "uncategorized" });
    clearInputFieldEl();
  }
});

onValue(shoppingListInDB, function (snapshot) {
  if (snapshot.exists()) {
    let itemsArray = Object.entries(snapshot.val());

    clearAllShoppingLists();

    itemsArray.forEach((item) => {
      appendItemToShoppingListEl(item);
    });
  } else {
    clearAllShoppingLists();
    categoriesEl.innerHTML = "Add some items baby gurl...";
  }
});

function clearAllShoppingLists() {
  document
    .querySelectorAll(".shopping-list")
    .forEach((list) => (list.innerHTML = ""));
}

function clearInputFieldEl() {
  inputFieldEl.value = "";
}

function appendItemToShoppingListEl(item) {
  let itemID = item[0];
  let itemData = item[1];
  let itemValue = itemData.name;
  let category = itemData.category;

  let newEl = document.createElement("li");
  newEl.textContent = itemValue;
  newEl.draggable = true;
  newEl.dataset.id = itemID;

  newEl.addEventListener("dblclick", function () {
    let exactLocationOfItemInDB = ref(database, `shoppingList/${itemID}`);
    remove(exactLocationOfItemInDB);
  });

  newEl.addEventListener("dragstart", handleDragStart);
  newEl.addEventListener("dragend", handleDragEnd);

  let categoryEl = document.querySelector(
    `.shopping-list[data-category="${category}"]`
  );
  if (categoryEl) {
    categoryEl.append(newEl);
  } else {
    document
      .querySelector('.shopping-list[data-category="uncategorized"]')
      .append(newEl);
  }
}

function handleDragStart(e) {
  e.dataTransfer.setData("text/plain", e.target.dataset.id);
  e.target.style.opacity = "0.5";
}

function handleDragEnd(e) {
  e.target.style.opacity = "1";
}

document.querySelectorAll(".shopping-list").forEach((list) => {
  list.addEventListener("dragover", handleDragOver);
  list.addEventListener("drop", handleDrop);
});

function handleDragOver(e) {
  e.preventDefault();
}

function handleDrop(e) {
  e.preventDefault();
  let itemID = e.dataTransfer.getData("text/plain");
  let newCategory = e.target.closest(".shopping-list").dataset.category;

  let itemRef = ref(database, `shoppingList/${itemID}`);
  update(itemRef, { category: newCategory });
}
