var uid = null;

AFRAME.registerComponent("markerhandler", {
  init: async function () {
    
    //Get Table Number
    if (uid === null) {
      //call the function
      this.askuid();
    }

    //Get the dishes collection
    var toys = await this.gettoys();

    //makerFound Event
    this.el.addEventListener("markerFound", () => {
      if (uid !== null) {
        var markerId = this.el.id;
        this.handleMarkerFound(toys, markerId);
      }
    });
    //markerLost Event
    this.el.addEventListener("markerLost", () => {
      this.handleMarkerLost();
    });
  },
  askuid: function () {
    var iconUrl = "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    // add swal with input
    swal({ icon: "warning", title: "Add user id", 
    content: { element: "input", attributes: { placeholder: "Type your user id", type: "number", min: 1 }}, 
    closeOnClickOutside: false,
})
.then((result) => {
  uid=result
   
})




  },

  handleMarkerFound: function (toys, markerId) {
    // Getting today's day
    var todaysDate = new Date();
    var todaysDay = todaysDate.getDay();

    // sunday - saturday : 0 - 6
    var days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday"
    ];

    //Get the dish based on ID
    var toy = toys.filter(toy => toy.id === markerId)[0];

    //Check if the dish is available today
    if (toy.unavailable_days.includes(days[todaysDay])) {
      //write the code here
      swal({
        icon:"morning",
        title: "This crane serves "+ toy.toy_name + " unavailable for work.",
        text: "We recommend trying your work!",
        timer:2000,
      })
    }
    else{
      var model = document.querySelector(`#model-${toy.id}`);
      model.setAttribute("position", toy.model_geometry.position);
      model.setAttribute("rotation", toy.model_geometry.position);
      model.setAttribute("scale", toy.model_geometry.position);
      model.setAttribute("visible", true);

      var ingredientsContainer = document.querySelector(`#main-plane-${toy.id}`);
      ingredientsContainer.setAttribute("visible", true);

      var priceplane = document.querySelector(`#price-plane-${toy.id}`);
      priceplane.setAttribute("visible",true)

      var ratingButton = document.getElementById("rating-button");
      var orderButton = document.getElementById("order-button");

    }

      if (tableNumber != null) {
        //Handling Click Events
        ratingButton.addEventListener("click", function () {
          swal({
            icon: "warning",
            title: "Rate Dish",
            text: "Work In Progress"
          });
        });

        orderButtton.addEventListener("click", () => {
          var uid;
          uid <= 9 ? (uid = `T0${uid}`) : `T${uid}`;
          this.handleOrder(uid, toy);

         //add swal
         swal({
          
            icon:"morning",
            title: "order_placed",
            text: "thank you for placing order",
            timer:2000,
        
    
         })
        })
    }
  },
  handleOrder: function (uid, toy) {
    // Reading current table order details
    //write firebase query
    firebase .firestore() .collection("users") .doc(uid) .get() .then(doc => { var details = doc.data();

        if (details["current_orders"][toy.id]) {
          // Increasing Current Quantity
          details["current_orders"][toy.id]["quantity"] += 1;

          //Calculating Subtotal of item
          var currentQuantity = details["current_orders"][toy.id]["quantity"];

          details["current_orders"][toy.id]["subtotal"] =
            currentQuantity * toy.price;
        } else {
          details["current_orders"][toy.id] = {
            item: toy.toy_name,
            price: toy.price,
            quantity: 1,
            subtotal: toy.price * 1
          };
        }

        details.total_bill += toy.price;

        //Updating db
        firebase
          .firestore()
          .collection("users")
          .doc(doc.id)
          .update(details);
      });
  },
  //Function to get the dishes collection from db
  getAllToys: async function () {
    return await firebase
      .firestore()
      .collection("toys")
      .get()
      .then(snap => {
        return snap.docs.map(doc => doc.data());
      });
  },
  handleMarkerLost: function () {
    // Changing button div visibility
    var buttonDiv = document.getElementById("button-div");
    buttonDiv.style.display = "none";
  },
handleOrderSummary: async function () {
  // Changing modal div visibility
  var modalDiv = document.getElementById("modal-div");
  modalDiv.style.display = "flex";

  var uidBodyTag = document.getElementById("bill-uid-body");

  // Removing old tr data
  uidBodyTag.innerHTML = "";

  // Getting Table Number
  var uid;
  uid <= 9 ? (uid = `T0${uid}`) : `T${uid}`;

  // Getting Order Summary from database
  var orderSummary = await this.getOrderSummary(uid);

  var currentOrders = Object.keys(orderSummary.current_orders);

  currentOrders.map(i => {
    var tr = document.createElement("tr");
    var item = document.createElement("td");
    var price = document.createElement("td");
    var quantity = document.createElement("td");
    var subtotal = document.createElement("td");

    item.innerHTML = orderSummary.current_orders[i].item;
    price.innerHTML = "$" + orderSummary.current_orders[i].price;
    price.setAttribute("class", "text-center");

    quantity.innerHTML = orderSummary.current_orders[i].quantity;
    quantity.setAttribute("class", "text-center");

    subtotal.innerHTML = "$" + orderSummary.current_orders[i].subtotal;
    subtotal.setAttribute("class", "text-center");

    tr.appendChild(item);
    tr.appendChild(price);
    tr.appendChild(quantity);
    tr.appendChild(subtotal);
    tableBodyTag.appendChild(tr);
  });

  var totalTr = document.createElement("tr");

  var td1 = document.createElement("td");
  td1.setAttribute("class", "no-line");

  var td2 = document.createElement("td");
  td1.setAttribute("class", "no-line");

  var td3 = document.createElement("td");
  td1.setAttribute("class", "no-line text-cente");

  var strongTag = document.createElement("strong");
  strongTag.innerHTML = "Total";
  td3.appendChild(strongTag);

  var td4 = document.createElement("td");
  td1.setAttribute("class", "no-line text-right");
  td4.innerHTML = "$" + orderSummary.total_bill;

  totalTr.appendChild(td1);
  totalTr.appendChild(td2);
  totalTr.appendChild(td3);
  totalTr.appendChild(td4);

  tableBodyTag.appendChild(totalTr);
},
handlePayment: function () {
  // Close Modal
  document.getElementById("modal-div").style.display = "none";

  // Getting Table Number
  var uid;
  uid <= 9 ? (uid = `T0${uid}`) : `T${uid}`;

  // Reseting current orders and total bill
  firebase
    .firestore()
    .collection("tables")
    .doc(uid)
    .update({
      current_orders: {},
      total_bill: 0
    })
    .then(() => {
      swal({
        icon: "success",
        title: "Thanks For Paying !",
        text: "We Hope You like our work !!",
        timer: 2500,
        buttons: false
      });
    });
},
handleRatings: async function (toy) {

  // Getting Table Number
  var uid;
  uid <= 9 ? (uid = `T0${uid}`) : `T${uid}`;
  
  // Getting Order Summary from database
  var orderSummary = await this.getOrderSummary(uid);

  var currentOrders = Object.keys(orderSummary.current_orders);    

  if (currentOrders.length > 0 && currentOrders==toy.id) {
    
    // Close Modal
    document.getElementById("rating-modal-div").style.display = "flex";
    document.getElementById("rating-input").value = "0";
    document.getElementById("feedback-input").value = "";

    //Submit button click event
    var saveRatingButton = document.getElementById("save-rating-button");

    saveRatingButton.addEventListener("click", () => {
      document.getElementById("rating-modal-div").style.display = "none";
      //Get the input value(Review & Rating)
      var rating = document.getElementById("rating-input").value;
      var feedback = document.getElementById("feedback-input").value;

      //Update db
      firebase
        .firestore()
        .collection("toys")
        .doc(toy.id)
        .update({
          last_review: feedback,
          last_rating: rating
        })
        .then(() => {
          swal({
            icon: "success",
            title: "Thanks For Rating!",
            text: "We Hope You Like work !!",
            timer: 2500,
            buttons: false
          });
        });
    });
  } else{
    swal({
      icon: "warning",
      title: "Oops!",
      text: "No toy found to give ratings!!",
      timer: 2500,
      buttons: false
    });
  }

},

});
