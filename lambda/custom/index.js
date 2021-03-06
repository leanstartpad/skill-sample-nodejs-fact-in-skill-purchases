'use strict';

const Alexa = require('ask-sdk');
var https = require('https');
const APP_ID = "";

/*
    Static list of facts across 3 categories that serve as
    the free and premium content served by the Skill
*/
const ALL_FACTS = [
        {   type: "science", fact: "There is enough DNA in an average person’s body to stretch from the sun to Pluto and back — 17 times."    },
        {   type: "science", fact: "The average human body carries ten times more bacterial cells than human cells."    },
        {   type: "science", fact: "It can take a photon 40,000 years to travel from the core of the sun to its surface, but only 8 minutes to travel the rest of the way to Earth."    },
        {   type: "science", fact: "At over 2000 kilometers long, The Great Barrier Reef is the largest living structure on Earth."    },
        {   type: "science", fact: "There are 8 times as many atoms in a teaspoonful of water as there are teaspoonfuls of water in the Atlantic ocean."    },
        {   type: "science", fact: "The average person walks the equivalent of five times around the world in a lifetime."    },
        {   type: "science", fact: "When Helium is cooled to absolute zero it flows against gravity and will start running up and over the lip of a glass container!"    },
        {   type: "science", fact: "An individual blood cell takes about 60 seconds to make a complete circuit of the body."    },
        {   type: "science", fact: "The longest cells in the human body are the motor neurons. They can be up to 4.5 feet (1.37 meters) long and run from the lower spinal cord to the big toe."    },
        {   type: "science", fact: "The human eye blinks an average of 4,200,000 times a year."    },
        {   type: "history", fact: "The Hundred Years War actually lasted 116 years from thirteen thirty seven to fourteen fifty three."    },
        {   type: "history", fact: "There are ninety two known cases of nuclear bombs lost at sea."    },
        {   type: "history", fact: "Despite popular belief, Napoleon Bonaparte stood 5 feet 6 inch tall. Average height for men at the time."    },
        {   type: "history", fact: "Leonardo Da Vinci designed the first helicopter, tank, submarine, parachute and ammunition igniter... Five hundred years ago."    },
        {   type: "history", fact: "The shortest war on record was fought between Zanzibar and England in eighteen ninety six. Zanzibar surrendered after 38 minutes."    },
        {   type: "history", fact: "X-rays of the Mona Lisa show that there are 3 different versions under the present one."    },
        {   type: "history", fact: "At Andrew Jackson's funeral in 1845, his pet parrot had to be removed because it was swearing too much."    },
        {   type: "history", fact: "English was once a language for “commoners,” while the British elites spoke French."    },
        {   type: "history", fact: "In ancient Egypt, servants were smeared with honey in order to attract flies away from the pharaoh."    },
        {   type: "history", fact: "Ronald Reagan was a lifeguard during high school and saved 77 people’s lives."    },
        {   type: "space", fact: "A year on Mercury is just 88 days long."    },
        {   type: "space", fact: "Despite being farther from the Sun, Venus experiences higher temperatures than Mercury."    },
        {   type: "space", fact: "Venus rotates anti-clockwise, possibly because of a collision in the past with an asteroid."    },
        {   type: "space", fact: "On Mars, the Sun appears about half the size as it does on Earth."    },
        {   type: "space", fact: "Earth is the only planet not named after a god."    },
        {   type: "space", fact: "Jupiter has the shortest day of all the planets."    },
        {   type: "space", fact: "The Milky Way galaxy will collide with the Andromeda Galaxy in about 5 billion years."    },
        {   type: "space", fact: "The Sun contains 99.86% of the mass in the Solar System."    },
        {   type: "space", fact: "The Sun is an almost perfect sphere."    },
        {   type: "space", fact: "A total solar eclipse can happen once every 1 to 2 years. This makes them a rare event."    }
];


const upsellMessage = {};
upsellMessage['science_pack'] = "With the science pack, you will have unlimited access to inspiring facts on science and technology.";
upsellMessage['history_pack'] = "With the History pack, you will have unlimited access to thought provoking facts on world history.";
upsellMessage['space_pack']   = "With the Space pack, you will have unlimited access to our facts about space and the universe. ";
upsellMessage['all_access']   = "With our all access subscription, you get unlimited ongoing access to all our fact categories including any new ones we add.";

const skill_name = "Infinity Gauntlet";



/*
    Function to demonstrate how to filter inSkillProduct list to get list of
    all entitled products to render Skill CX accordingly
*/
function getAllEntitledProducts (inSkillProductList) {
    var entitledProductList = inSkillProductList.filter(record => record.entitled == "ENTITLED");
    return entitledProductList;
}

function getRandomFact(facts) {
    const factIndex = Math.floor(Math.random() * facts.length);
    return facts[factIndex].fact;
}

function getRandomYesNoQuestion() {
    const questions = ["Would you like another fact?", "Can I tell you another fact?", "Do you want to hear another fact?"];
    return " " + questions[Math.floor(Math.random() * questions.length)];
}

function getRandomGoodbye()
{
    const goodbyes = ["OK.  Goodbye!", "Have a great day!", "Come back again soon!"];
    return " " + goodbyes[Math.floor(Math.random() * goodbyes.length)];
}

/*
    Helper function that returns a speakable list of product names from a list of
    entitled products.
*/
function getSpeakableListOfProducts (entitleProductsList) {
    var productNameList = entitleProductsList.map(item => item.name);
    var productListSpeech = productNameList.join(', '); // Generate a single string with comma separated product names
    productListSpeech = productListSpeech.replace(/_([^_]*)$/, 'and ' +'$1'); // Replace last comman with an 'and '
    return productListSpeech;
}

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        console.log("IN LAUNCHREQUEST");

        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
 
        return ms.getInSkillProducts(locale).then(function(res) {
            
            var entitledProducts = getAllEntitledProducts(res.inSkillProducts);
            if (entitledProducts && entitledProducts.length > 0)  {
                // Customer owns one or more products
    
                return handlerInput.responseBuilder
                    .speak("Welcome to " + skill_name + ". You currently own " + getSpeakableListOfProducts(entitledProducts) +
                                     " products. To hear a random fact, you could say, 'Tell me a fact' or you can ask"  +
                                 " for a specific category you have purchased, for example, say 'Tell me a science fact'. " +
                                 " To know what else you can buy, say, 'What can i buy?'. So, what can I help you" +
                                 " with?")
                    .reprompt("I didn't catch that. What can I help you with?")
                    .getResponse();
            }
            else    {
                // Not entitled to anything yet.
                console.log('No entitledProducts');
                return handlerInput.responseBuilder
                    .speak("Welcome to " + skill_name + ". To hear a random fact you can say 'Tell me a fact'," +
                                     " or to hear about the premium categories for purchase, say 'What can I buy'. " +
                                     " For help, say , 'Help me'... So, What can I help you with?")
                    .reprompt("I didn't catch that. What can I help you with?")
                    .getResponse();
            }
        },
        function(err) {
            console.log('Error calling InSkillProducts API: ' + err );

            return handlerInput.responseBuilder
                .speak("Something went wrong in loading your purchase history")
                .getResponse();
        });
   }
};       // End LaunchRequestHandler


const GetFactHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'GetFactIntent';
    },
    handle(handlerInput) {
        console.log("In GetFactHandler");
        
        const factText = getRandomFact(ALL_FACTS);
        return handlerInput.responseBuilder
               .speak("Here's your random fact: " + factText + getRandomYesNoQuestion())
               .reprompt(getRandomYesNoQuestion())
               .getResponse();
    }
};

//IF THE USER SAYS YES, THEY WANT ANOTHER FACT.
const YesHandler = { 
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
    },
    handle(handlerInput) {
        console.log("In YesHandler");
        
        let speakResponse = "Here's your random fact: " + getRandomFact(ALL_FACTS) + getRandomYesNoQuestion()
        let repromptResponse = getRandomYesNoQuestion();

        return handlerInput.responseBuilder
               .speak(speakResponse)
               .reprompt(repromptResponse)
               .getResponse();
    }
};

//IF THE USER SAYS NO, THEY DON'T WANT ANOTHER FACT.  EXIT THE SKILL.
const NoHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        console.log("IN NOHANDLER");

        let speakResponse = getRandomGoodbye();
        return handlerInput.responseBuilder
               .speak(speakResponse)
               .getResponse();
    }
};


const GetCategoryFactHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "IntentRequest" &&
               handlerInput.requestEnvelope.request.intent.name === "GetCategoryFactIntent";
    },
    handle(handlerInput) {
        console.log("In GetCategoryFactHandler");

        let factCategory = getResolvedValue(handlerInput.requestEnvelope, "factCategory");
        console.log("FACT CATEGORY = XX" + factCategory + "XX");
        let categoryFacts = ALL_FACTS;
        
        //IF THERE WAS NOT AN ENTITY RESOLUTION MATCH FOR THIS SLOT VALUE
        if (factCategory === undefined) {
            const slotValue = getSpokenValue(handlerInput.requestEnvelope, "factCategory");
            let speakPrefix = "";
            if (slotValue != undefined) speakPrefix = "I heard you say " + slotValue + ". ";
            const speakResponse = speakPrefix + "I don't have facts for that category.  You can ask for science, space, or history facts.  Which one would you like?"
            const repromptResponse = "Which fact category would you like?  I have science, space, or history.";
            
            return handlerInput.responseBuilder
                   .speak(speakResponse)
                   .reprompt(repromptResponse)
                   .getResponse();
        }
        //IF THERE WAS AN ENTITY RESOLUTION MATCH FOR THIS SLOT VALUE
        else {
            categoryFacts = ALL_FACTS.filter(record => record.type == factCategory);
            const locale = handlerInput.requestEnvelope.request.locale;
            const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
     
            return ms.getInSkillProducts(locale).then(function(res) {
                var subscription = res.inSkillProducts.filter(record => record.referenceName == 'all_access');
                var category_product = res.inSkillProducts.filter(record => record.referenceName == factCategory + "_pack");
                
                //IF USER HAS ACCESS TO THIS PRODUCT
                if (isEntitled(subscription) || isEntitled(category_product)) {
                    let speakResponse = "Here's your " + factCategory + " fact: " + getRandomFact(categoryFacts) + getRandomYesNoQuestion()
                    let repromptResponse = getRandomYesNoQuestion();

                    return handlerInput.responseBuilder
                        .speak(speakResponse)
                        .reprompt(repromptResponse)
                        .getResponse();
                }
                else {
                    const upsellMessage = "You don't currently own the " + factCategory + " pack. " + category_product[0].summary + " Want to learn more?"
                    
                    return handlerInput.responseBuilder
                           .addDirective({
                                'type': 'Connections.SendRequest',
                                'name': 'Upsell',
                                'payload': {
                                    'InSkillProduct': {
                                        'productId': category_product[0].productId
                                    },
                                    'upsellMessage': upsellMessage
                                },
                                'token': 'correlationToken'
                            })
                            .getResponse();
                }
            });
        }
   }
};


// Following handler demonstrates how skills can hanlde user requests to discover what 
// products are available for purchase in-skill.
// Use says: Alexa, ask Premium facts what can i buy
const ShoppingHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'ShoppingIntent';
    },
    handle(handlerInput) {
        console.log("In Shopping Handler");
    
    // Inform the user aboutwhat products are available for purchase
        
        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
 
        return ms.getInSkillProducts(locale).then(function(res) {
            
            var purchasableProducts = res.inSkillProducts.filter(record => record.entitled == 'NOT_ENTITLED' && record.purchasable == 'PURCHASABLE');

            return handlerInput.responseBuilder
                .speak("Products available for purchase at this time are " + getSpeakableListOfProducts(purchasableProducts) +
                                         ". To learn more about a product, say 'Tell me more about' followed by the product name. " +
                                         " If you are ready to buy say 'Buy' followed by the product name. So what can I help you with?")
                .reprompt("I didn't catch that. What can I help you with?")
                .getResponse();
        });
   }
};

// Following handler demonstrates how skills can hanlde user requests to discover what 
// products are available for purchase in-skill.
// Use says: Alexa, ask Premium facts what can i buy
const ProductDetailHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'ProductDetailIntent';
    },
    handle(handlerInput) {
        console.log("IN PRODUCT DETAIL HANDLER");
    
    // Describe the requested product to the user using localized information from the entitlements API
      
        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
 
        return ms.getInSkillProducts(locale).then(function(res) {
            let productCategory = getResolvedValue(handlerInput.requestEnvelope, "productCategory");

            //NO ENTITY RESOLUTION MATCH
            if (productCategory === undefined) {
                return handlerInput.responseBuilder
                           .speak("I don't think we have a product by that name.  Can you try again?")
                           .reprompt("I didn't catch that. Can you try again?")
                           .getResponse();
            }
            else {
                if (productCategory != "all_access") productCategory += "_pack";

                let product = res.inSkillProducts.filter(record => record.referenceName == productCategory);

                if (isProduct(product)) {
                    let speakResponse = product[0].summary + ". To buy it, say Buy " + product[0].name + ". ";
                    let repromptResponse = "I didn't catch that. To buy " + product[0].name + ", say Buy " + product[0].name + ". ";
                    return handlerInput.responseBuilder
                           .speak(speakResponse)
                           .reprompt(repromptResponse)
                           .getResponse();
                }
                else {
                    return handlerInput.responseBuilder
                           .speak("I don't think we have a product by that name.  Can you try again?")
                           .reprompt("I didn't catch that. Can you try again?")
                           .getResponse();
                }
            }
        });
   }
};

// Following handler demonstrates how Skills would recieve Buy requests from customers
// and then trigger a Purchase flow request to Alexa
const BuyHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'BuyIntent';
  },
  handle(handlerInput) {
    console.log("IN BUYINTENTHANDLER");
    
    // Inform the user about what products are available for purchase
        
        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
 
        return ms.getInSkillProducts(locale).then(function(res) {
            
            let productCategory = getResolvedValue(handlerInput.requestEnvelope, "productCategory");

            //NO ENTITY RESOLUTION MATCH
            if (productCategory === undefined) {
                productCategory = "all_access"
            }
            else {
                productCategory += "_pack";
            }

            let product = res.inSkillProducts.filter(record => record.referenceName == productCategory);

            return handlerInput.responseBuilder
            .addDirective({
                'type': 'Connections.SendRequest',
                'name': 'Buy',
                'payload': {
                            'InSkillProduct': {
                                'productId': product[0].productId
                            }
                },
                'token': 'correlationToken'
            })
            .getResponse();

        });
   }
};
  
// Following handler demonstrates how Skills would receive Cancel requests from customers
// and then trigger a cancel request to Alexa
// User says: Alexa, ask <skill name> to cancel <product name>
const CancelSubscriptionHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
               handlerInput.requestEnvelope.request.intent.name === 'CancelSubscriptionIntent';
    },
    handle(handlerInput) {
        console.log("IN CANCELINTENTHANDLER");

        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
 
        return ms.getInSkillProducts(locale).then(function(res) {
            let productCategory = getResolvedValue(handlerInput.requestEnvelope, "productCategory");

            if (productCategory === undefined) {
                productCategory = "all_access"
            }
            else {
                productCategory += "_pack";
            }

            var product = res.inSkillProducts.filter(record => record.referenceName == productCategory);

            return handlerInput.responseBuilder
                .addDirective({
                        'type': 'Connections.SendRequest',
                        'name': 'Cancel',
                        'payload': {
                            'InSkillProduct': {
                                'productId': product[0].productId
                            }
                        },
                        'token': 'correlationToken'
                    })
                    .getResponse();
        });
    }
};          

//THIS HANDLES THE CONNECTIONS.RESPONSE EVENT AFTER A BUY OCCURS.
const BuyResponseHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "Connections.Response" &&
               handlerInput.requestEnvelope.request.name === "Buy";
    },
    handle(handlerInput) {
        console.log("IN BUYRESPONSEHANDLER");

        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
        const productId = handlerInput.requestEnvelope.request.payload.productId;
 
        return ms.getInSkillProducts(locale).then(function(res) {
            let product = res.inSkillProducts.filter(record => record.productId == productId);
            console.log("PRODUCT = " + JSON.stringify(product));
            if (handlerInput.requestEnvelope.request.status.code == 200) {
                if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'ACCEPTED') {
                    let categoryFacts = ALL_FACTS;
                    if (product[0].referenceName != "all_access") categoryFacts = ALL_FACTS.filter(record => record.type == product[0].referenceName.replace("_pack", ""));
                    
                    const speakResponse = "You have unlocked the " + product[0].Name + ".  Here is your " + product[0].referenceName.replace("_pack", "").replace("all_access", "") + " fact: " + getRandomFact(categoryFacts) + getRandomYesNoQuestion();
                    const repromptResponse = getRandomYesNoQuestion();
                    return handlerInput.responseBuilder
                        .speak(speakResponse)
                        .reprompt(repromptResponse)
                        .getResponse();
                }
                else if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'DECLINED') {
                    const speakResponse = "Thanks for your interest in the " + product[0].name + ".  Would you like another random fact?";
                    const repromptResponse = "Would you like another random fact?";
                    return handlerInput.responseBuilder
                        .speak(speakResponse)
                        .reprompt(repromptResponse)
                        .getResponse();
                }
            }
            else    {
                // Somethign failed.
                console.log('Connections.Response indicated failure. error:' + handlerInput.requestEnvelope.request.status.message);
                
                return handlerInput.responseBuilder
                    .speak("There was an error handling your purchase request. Please try again or contact us for help.")
                    .getResponse();
            }
        });
   }
};

//THIS HANDLES THE CONNECTIONS.RESPONSE EVENT AFTER A CANCEL OCCURS.
const CancelResponseHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "Connections.Response" &&
               handlerInput.requestEnvelope.request.name === "Cancel";
    },
    handle(handlerInput) {
        console.log("IN CANCELRESPONSEHANDLER");

        const locale = handlerInput.requestEnvelope.request.locale;
        const ms = handlerInput.serviceClientFactory.getMonetizationServiceClient();
        const productId = handlerInput.requestEnvelope.request.payload.productId;
 
        return ms.getInSkillProducts(locale).then(function(res) {
            let product = res.inSkillProducts.filter(record => record.productId == productId);
            console.log("PRODUCT = " + JSON.stringify(product));
            if (handlerInput.requestEnvelope.request.status.code == 200) {
                if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'ACCEPTED') {
                    
                    const speakResponse = "You have successfully cancelled your subscription. " + getRandomYesNoQuestion();
                    const repromptResponse = getRandomYesNoQuestion();
                    return handlerInput.responseBuilder
                        .speak(speakResponse)
                        .reprompt(repromptResponse)
                        .getResponse();
                }
                else if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'NOT_ENTITLED') {
                    const speakResponse = "You don't currently have a subscription to cancel. " + getRandomYesNoQuestion();
                    const repromptResponse = getRandomYesNoQuestion();
                    return handlerInput.responseBuilder
                        .speak(speakResponse)
                        .reprompt(repromptResponse)
                        .getResponse();
                }
            }
            else    {
                // Somethign failed.
                console.log('Connections.Response indicated failure. error:' + handlerInput.requestEnvelope.request.status.message);
                
                return handlerInput.responseBuilder
                    .speak("There was an error handling your purchase request. Please try again or contact us for help.")
                    .getResponse();
            }
        });
   }
};

//THIS HANDLES THE CONNECTIONS.RESPONSE EVENT AFTER A BUY OCCURS.
const UpsellResponseHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === "Connections.Response" &&
               handlerInput.requestEnvelope.request.name === "Upsell";
    },
    handle(handlerInput) {
        console.log("IN UPSELLRESPONSEHANDLER");

        if (handlerInput.requestEnvelope.request.status.code == 200) {
            if (handlerInput.requestEnvelope.request.payload.purchaseResult == 'DECLINED') {
                const speakResponse = "OK.  Here's a random fact: " + getRandomFact(ALL_FACTS) + " Would you like another random fact?";
                const repromptResponse = "Would you like another random fact?";
                return handlerInput.responseBuilder
                    .speak(speakResponse)
                    .reprompt(repromptResponse)
                    .getResponse();
            }
        }
        else    {
            // Somethign failed.
            console.log('Connections.Response indicated failure. error:' + handlerInput.requestEnvelope.request.status.message);
            
            return handlerInput.responseBuilder
                .speak("There was an error handling your purchase request. Please try again or contact us for help.")
                .getResponse();
        }
   }
};


const SessionEndedHandler = { 
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest' ||
           (handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent') ||
           (handlerInput.requestEnvelope.request.type === 'IntentRequest' && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent');
  },
  handle(handlerInput) {
    console.log("IN SESSIONENDEDHANDLER");
            return handlerInput.responseBuilder
                .speak(getRandomGoodbye())
                .getResponse();
   }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
    console.log("Error handled: " + JSON.stringify(error.message));
    console.log('handlerInput:' + JSON.stringify(handlerInput));
    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please try again.')
      .getResponse();
  },
};

function getResolvedValue(requestEnvelope, slotName)
{
    if (requestEnvelope &&
        requestEnvelope.request &&
        requestEnvelope.request.intent &&
        requestEnvelope.request.intent.slots &&
        requestEnvelope.request.intent.slots[slotName] &&
        requestEnvelope.request.intent.slots[slotName].resolutions &&
        requestEnvelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority &&
        requestEnvelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0] &&
        requestEnvelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0].values &&
        requestEnvelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0].values[0] &&
        requestEnvelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0].values[0].value &&
        requestEnvelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0].values[0].value.name)
    {
        return requestEnvelope.request.intent.slots[slotName].resolutions.resolutionsPerAuthority[0].values[0].value.name;
    }
    else return undefined;
}

function getSpokenValue(requestEnvelope, slotName)
{
    if (requestEnvelope &&
        requestEnvelope.request &&
        requestEnvelope.request.intent &&
        requestEnvelope.request.intent.slots &&
        requestEnvelope.request.intent.slots[slotName] &&
        requestEnvelope.request.intent.slots[slotName].value)
    {
        return requestEnvelope.request.intent.slots[slotName].value;    
    }
    else return undefined;
}

function isProduct(product)
{
    return product &&
           product.length > 0;
}

function isEntitled(product)
{
    return isProduct(product) &&
           product[0].entitled == 'ENTITLED';
}

function getProductByProductId(productId)
{
    var product_record = res.inSkillProducts.filter(record => record.referenceName == productRef);
}

const RequestLog = {
    process(handlerInput) {
        console.log("REQUEST ENVELOPE = " + JSON.stringify(handlerInput.requestEnvelope));    
        return;
    }
};

const ResponseLog = {
    process(handlerInput) {
        console.log("RESPONSE BUILDER = " + JSON.stringify(handlerInput));
        return;   
    }
};

exports.handler = Alexa.SkillBuilders.standard() 
.addRequestHandlers(
    LaunchRequestHandler,
    GetFactHandler,
    YesHandler,
    NoHandler,
    GetCategoryFactHandler,
    BuyResponseHandler,
    CancelResponseHandler,
    UpsellResponseHandler,
    ShoppingHandler,
    ProductDetailHandler,
    BuyHandler,
    CancelSubscriptionHandler,
    SessionEndedHandler
  )
  .addRequestInterceptors(RequestLog)
  .addResponseInterceptors(ResponseLog)
  .addErrorHandlers(ErrorHandler)
  .lambda();


