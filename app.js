// Budget Controller
var budgetController = (function() {
    var expId = 0, incId = 0;
    var Expense = function(id, description, value){
        this.id = id,
        this.description = description,
        this.value =  value,
        this.percentage = -1
    };
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100);    
        }
        else{
            this.percentage = -1;
        }        
    };
    
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }
    var Income = function(id, description, value){
        this.id = id,
        this.description = description,
        this.value =  value
    };
    
    var totalCalculation = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(curr){
           sum = sum + curr.value; 
        });
        data.totals[type] = sum;
    }
    var data = {
        allItems : {
            exp : [],
            inc : []
        },
        totals :{
            exp : 0,
            inc : 0
        },
        budget : 0,
        percentage : -1
    }
    
    return {
        addItem : function(type, des, val){
            var newItem;
            if(type == 'exp'){
                newItem = new Expense(expId, des, val);
                expId++;
            }
            else if(type == 'inc'){
                newItem = new Income(incId, des, val);
                incId++;
            }
            data.allItems[type].push(newItem);
            return newItem;
        },
        deleteItem : function(type, id){
            var index, indexArray;
            indexArray = data.allItems[type].map(function(current){
                return current.id;
            })
            
            index = indexArray.indexOf(id);
            console.log('Index is: ' +index);
            if(index != -1){
                data.allItems[type].splice(index,1);
            }
        },
        calculatePercentages : function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })
        },
        getPercentages : function(){
            var allPer = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPer;
        },
        calculateBudget : function(){
            //Sum all expenses and income
            totalCalculation('exp');
            totalCalculation('inc');
            
            //Calculate remaining funds
            data.budget = data.totals.inc - data.totals.exp;
            
            //Claculate % of income spent
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);    
            }
            else{
                data.percentage = -1;
            }
        },
        getBudget : function() {
            return {
                budget : data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percentage : data.percentage
            }
        },
        testing : function(){
            console.log(data);
        }
    }
})();



//UI Controller
var uIController = (function() {
    var input = [0,0,0];
    var DOMSTRINGS = {
        addType : '.add__type',
        addDescription : '.add__description',
        addValue : '.add__value',
        addBtn : '.add__btn',
        incomeList : '.income__list',
        expensesList : '.expenses__list',
        budgetValue : '.budget__value',
        incomeTotalValue : '.budget__income--value',
        expensesTotalValue : '.budget__expenses--value',
        percentageLabel : '.budget__expenses--percentage',
        container : '.container',
        expPercentage : '.item__percentage',
        monthLabel : '.budget__title--month'
    };
    return {
        getInput : function(){
            return {
                type : document.querySelector(DOMSTRINGS.addType).value,
                description : document.querySelector(DOMSTRINGS.addDescription).value,
                value : parseInt(document.querySelector(DOMSTRINGS.addValue).value)
            };
            
        },
        
        //Adding elements to UI
        addingToUI : function(obj, type){
            var html, newHtml, element;
            // Adding a html text with placeholders
            if(type == 'exp'){
                element = DOMSTRINGS.expensesList;
                html = '<div class="item clearfix" id="exp-'+obj.id+'"><div class="item__description">'+obj.description+'</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
        
            }
            else if(type == 'inc'){
                element = DOMSTRINGS.incomeList;
                html = '<div class="item clearfix" id="inc-'+obj.id+'"><div class="item__description">'+obj.description+'</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            // Replacing the placeholders with user entered data
            newHtml = html.replace('%value%', obj.value);
        
            // Placing the html into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    
        },
        deleteItemFromUI : function(id){
            var el = document.getElementById(id);
            el.parentNode.removeChild(el);
        },
        displayBudget : function(budg){
            document.querySelector(DOMSTRINGS.budgetValue).textContent = budg.budget;
            document.querySelector(DOMSTRINGS.incomeTotalValue).textContent = budg.totalInc;
            document.querySelector(DOMSTRINGS.expensesTotalValue).textContent = budg.totalExp;
            if(budg.percentage > 0){
                document.querySelector(DOMSTRINGS.percentageLabel).textContent = budg.percentage + '%';    
            }
            else{
                document.querySelector(DOMSTRINGS.percentageLabel).textContent = '---';
            }
        },
        displayPercentages : function(percentages){
            var fields = document.querySelectorAll(DOMSTRINGS.expPercentage);
            var nodeListForEach = function(list, callback){
                for( var i = 0; i < list.length; i++){
                    callback(list[i], i);
                }
            };
            
            nodeListForEach(fields, function(curr, index){
                if(percentages[index] > 0){
                    curr.textContent = percentages[index] + '%';    
                }
                else{
                    curr.textContent = '---';
                }
                
            });
            
        },
        getDOMStrings : function(){
            return DOMSTRINGS;
        },
        //Displaying current month
        displayMonth : function(){
            var now, month, year, months;
            now = new Date();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'Auguest',
                     'September', 'October', 'November', 'December'];
            year = now. getFullYear();
            
            document.querySelector(DOMSTRINGS.monthLabel).textContent = months[month] + ', ' +year;
            
        },
        
        // Clearing input fields
        clearFields : function(){
            var fileds, fieldsArray;
            fileds = document.querySelectorAll(DOMSTRINGS.addDescription + ', ' +DOMSTRINGS.addValue);
            fieldsArray = Array.prototype.slice.call(fileds);
            fieldsArray.forEach(function(curr, index, array){
                curr.value = '';
            })
            fieldsArray[0].focus();
        }
    }
})();


// App Controller 
var controller = (function(budgCtrl, uiCtrl) {
    var input, DOM, newItem;
    DOM = uiCtrl.getDOMStrings();
    var setUpEventListeners = function(){
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);    
        document.addEventListener('keypress', function(event){
            if(event.keyCode == 13 || event.which == 13){
            ctrlAddItem();
        }        
    });
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem)
    }
    
    function updateBudget(){
        // Calculating budget
        budgCtrl.calculateBudget();
        
        //getting budget
        var budget = budgCtrl.getBudget();
        
        console.log(budget);
        
        //Updating budget on UI
        uiCtrl.displayBudget(budget);
    }
    
    function updatePercentages(){
        // Calcualte expense percentages
        budgCtrl.calculatePercentages();
        
        // Get expense percentages from budget controller
        var percentages = budgCtrl.getPercentages();
        
        // Update UI with new expense percentages
        uiCtrl.displayPercentages(percentages);
        
    }
    
    function ctrlAddItem(){
        //Getting the field input
        input = uiCtrl.getInput();
        console.log(input);
        if((input.description != "") && (!isNaN(input.value)) && (input.value > 0)){
            //Adding the user entered data to the budget controller
            newItem = budgCtrl.addItem(input.type, input.description, input.value);
        
            //Displaying the newly added item to the UI list
            uiCtrl.addingToUI(newItem, input.type);
        
            //Clearing the input fields
            uiCtrl.clearFields();
            
            //Updating the budget
            updateBudget();
            
            
            //Updating expense percentages
            updatePercentages();
        }

    }
    
    var ctrlDeleteItem = function(event){
        var itemId, splitId, type, id;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemId){
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
            
            // Delete item from budget Controller list
            budgCtrl.deleteItem(type, id);
            
            // Delete item from UI
            uiCtrl.deleteItemFromUI(itemId);
            
            // Upadte budget 
            updateBudget();
            
            //Updating expense percentages
            updatePercentages();
        }
        
    }
    
    return {
        init : function(){
            setUpEventListeners();
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget : 0,
                totalInc : 0,
                totalExp : 0,
                percentage : '---'
            });
        }
    }

})(budgetController, uIController);


controller.init();