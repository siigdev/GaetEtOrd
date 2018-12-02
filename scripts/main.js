//On Window load show the modal
$(window).on('load',function(){
    $('#myModal').modal('show');
});

var turn = -1;
var cardsArray = [];

//When the game is started
function startGame(teamNames, teamColors) {
    var teams = [];
    //Create a new deck and shuffle the card objects within
    const myDeck = new Deck();
    for (var i = 0; i < teamNames.length; i++){
        teams.push(new Team(teamNames[i], teamColors[i], 0));
    }
    changeTeam();
    myDeck.shuffleCards();

    //Add the first three cards to the board 
    for(var i = 0; i < 3; i++){
        addCardToBoard();
    }  

    //Add two undefined cards
    addUndefinedCard();
    addUndefinedCard();
    function addUndefinedCard(){
        $("#cards").append("<div class='undefinedCards'></div>");
    }  

    //change teams turn function
    function changeTeam() {
        turn++;
        if (turn > teamNames.length-1) {
            turn -= teamNames.length;
        }
        this.currentTeam = teams[turn];
        updateInfoBoxes();
    }
    //Add a card to the board
    function addCardToBoard() {
        let curCard = myDeck.getCard();
        cardsArray.unshift(curCard);
        let cardHtml = "<div class='card'><p id='category'>" + curCard.category + "</p><p id='method'>" + curCard.method + "</p></div>";
        $("#cards div").removeClass("disabledCards");
        $(cardHtml).prependTo("#cards").one("click", function() { 
            $(this).text("");
            $(this).removeClass("card").addClass("undefinedCards");
            clickCard(cardsArray.indexOf(curCard), this); 
        });   
        if (cardsArray.length > 4){
            if (cardsArray[4] == undefined){
                $("#cards div").slice(0,4);
                cardsArray.slice(0,4);
            }
            else {
                $("#cards div").slice(0, 4).addClass("disabledCards");
            }
        }
        //Make sure only 5 cards can be on the table
        if($('#cards').children().length > 5){
            $("#cards div").slice(5, 7).remove();
        }
    }
    //Onclick-function when a card is chosen
    function clickCard(myCardIndex, el){ 
        var myCard = cardsArray[myCardIndex];
        var offset = $(el).offset();
        $("#cards div").addClass("disabledCards");
        $('body').append("<div class='pickedCard'><div class='pickedcard__face pickedcard__face--front'><p id='category'>" + myCard.category + "</p><p id='method'>" + myCard.method + "</p></div><div class='pickedcard__face pickedcard__face--back'></div></div>");
        $(".pickedCard").offset({ top: offset.top, left: offset.left});
        $('#startTime').show();
        $('#infobox').text("Du har valgt at " + myCard.method + " " + myCard.category);
        for(var i = 0; i < myCard.content.length; i++)
            {
                $('.pickedcard__face--back').append("<p id='ord'>" + myCard.content[i] + "</p>");
            }

        $(".pickedCard").animate({
            left: $(".pickedCard").parent().width() / 2 - 255 / 2,
            width: '255px',
            height: '375px',
        }, 700, function() {
            $(".pickedCard").toggleClass('is-flipped');
        });

        //Onclick-function on Start Time-button to add a countdown timer.
        $('#startTime').unbind('click').one('click', function(){   
            $('#startTime').hide();
            $('#timeBar').show();
            var startWidth = 0;
            var timeInMs = 50; //Set time in ms
            var id = setInterval(frame, timeInMs);
            var counter = 0;
            $('#timeBar').css("background-color", "#4CAF50");
            function frame() {
                counter++;
                if (counter > timeInMs*3-70){ 
                    $('#timeBar').css("background-color", "#c6262e");
                }
                if (startWidth >= 100) {
                    clearInterval(id);
                    $('#timer').html("Tiden er gåæt! Hold nummer x kan nu forsøge at gætte et ord");
                    $('#startTime').prop('disabled', true);
                    calcPoints(myCardIndex);
                } else {
                    startWidth++; 
                $('#timeBar').width(startWidth + '%'); 
                }
            }
            
        });
        if (myCardIndex == 4) {
            cardsArray.pop();
        }
        else{
            cardsArray[myCardIndex] = undefined;
        }
    }
    //Calculate the points after each round
    function calcPoints(index) {
        var extraPoints = 0;
        if (index == 3 || index == 4){
            extraPoints = 1;
        }
        $('#infobox').text("Tiden er gået!");
        $('#pointContainer').append("<br>Hvor mange ord gættede I rigtigt? " + "<select id='numberOfPointsOne'><option value='0'>0</option><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option></select><br>");
        //$('#timer').append("Hvor mange ord gættede modstanderen rigtigt? " + "<select id='numberOfPointsLast'><option value='0'>0</option><option value='1'>1</option><option value='2'>2</option><option value='3'>3</option><option value='4'>4</option><option value='5'>5</option></select>");
        $('#pointBtn').show();
        $('#pointBtn').unbind('click').click(function(){
            $('#pointBtn').hide();
            numberOfPointsFirst = $("#numberOfPointsOne option:selected").val();
            currentTeam.points = currentTeam.points + extraPoints + parseInt($("#numberOfPointsOne option:selected").val());
            //numberOfPointsSecond = $("#numberOfPointsLast option:selected").text();
            $('#pointContainer').html("");
            $( ".pickedCard" ).remove();
            changeTeam();
            addCardToBoard();
            $('#timeBar').hide();
        });
    }
    //Method for updating the results, turns and info boxes
    function updateInfoBoxes() {
        $('#resultbox').text("");
        for (var i = 0; i < teams.length; i++){
            $('#resultbox').append('Hold ' + teams[i].name + ' med  ' + teams[i].points + ' Points<br>');
        }
        $('#turnbox').text("Det er nu hold " + this.currentTeam.name + " ");
        $('#infobox').text("Vælg et af nedenstående kort: ");
    }
}

//On page load: Select number of teams and colors
$(document).ready(function(){
    $("#numberOfTeamsBtn").click(function(){
        $('#myModal').modal('hide');
        $("#myModal2").modal('show');
        numberOfTeams = $("#numberOfTeamsSelected option:selected").text();
        teamSettings(numberOfTeams);
        
    });
});

function teamSettings(){
    var teamNames = [];
    var teamColors = [];
    var colorArray = ['blue', 'green', 'yellow', 'red'];  
    for(i = +1; i-1 < numberOfTeams; i++){
        $("#teamSettingsModal").append("<input type='text' id='teamName" + i + "' placeholder='Name for team " + i + "'><br>");
        
    }

    $("#teamSettingsBtn").click(function(){
        $('#myModal2').modal('hide');
        for(i = +1; i-1 < numberOfTeams; i++){
            var x = document.getElementById("teamName" + i).value;
            teamNames.push(x);
            teamColors.push(colorArray[i-1]);
        }
        startGame(teamNames, teamColors);
    });
}

//Card Object
class Card {
    constructor(idno, method, category, content, position){
        this.idno = idno;
        this.method = method;
        this.category = category;
        this.content = content;
        this.position = position;
    }
}

//Team Object
class Team {
    constructor(name, color, points) {
        this.color = color;
        this.name = name;
        this.points = points;
    }
}
//Deck object
class Deck {
    constructor() {
        this.deck = [];
        this.deck.push(new Card(0, 'Tale', 'Sommer', ['Tale', 'Sommer', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(1, 'Mime', 'Vinter', ['Mime', 'Vinter', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(2, 'Lyde', 'Forår', ['Lyde', 'Forår', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(3, 'Tegne', 'Efterår', ['Tegne', 'Efterår', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(4, 'Tegne', 'Påske', ['Tegne', 'Påske', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(5, 'Lyde', 'Jul', ['Lyde', 'Jul', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(6, 'Mime', 'Ferie', ['Mime', 'Ferie', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(7, 'Tale', 'Sommer', ['Tale', 'Sommer', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(8, 'Mime', 'Vinter', ['Mime', 'Vinter', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(9, 'Lyde', 'Forår', ['Lyde', 'Forår', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(10, 'Tegne', 'Efterår', ['Tegne', 'Efterår', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(11, 'Tegne', 'Påske', ['Tegne', 'Påske', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(12, 'Lyde', 'Jul', ['Lyde', 'Jul', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(13, 'Mime', 'Ferie', ['Mime', 'Ferie', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(14, 'Tale', 'Sommer', ['Tale', 'Sommer', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(15, 'Mime', 'Vinter', ['Mime', 'Vinter', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(16, 'Lyde', 'Forår', ['Lyde', 'Forår', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(17, 'Tegne', 'Efterår', ['Tegne', 'Efterår', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(18, 'Tegne', 'Påske', ['Tegne', 'Påske', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(19, 'Lyde', 'Jul', ['Lyde', 'Jul', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(20, 'Mime', 'Ferie', ['Mime', 'Ferie', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(21, 'Tale', 'Sommer', ['Tale', 'Sommer', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(22, 'Mime', 'Vinter', ['Mime', 'Vinter', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(23, 'Lyde', 'Forår', ['Lyde', 'Forår', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(24, 'Tegne', 'Efterår', ['Tegne', 'Efterår', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(25, 'Tegne', 'Påske', ['Tegne', 'Påske', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(26, 'Lyde', 'Jul', ['Lyde', 'Jul', 'Sommer', 'Something', 'Something :)']))
        this.deck.push(new Card(27, 'Mime', 'Ferie', ['Mime', 'Ferie', 'Sommer', 'Something', 'Something :)']))
    }
    //Shuffle card method to avoid same cards at each start
    shuffleCards(){
        const deck = this.deck;
        for (var i = 0; i < 1000; i++){
            var location1 = Math.floor(Math.random() * deck.length);
            var location2 = Math.floor(Math.random() * deck.length);
            var tmp = deck[location1];
    
            deck[location1] = deck[location2];
            deck[location2] = tmp;
        }
        return this;
    }
    //Get a card from the deck and prevent getting it again
    getCard(){
        return this.deck.pop();
    }
}