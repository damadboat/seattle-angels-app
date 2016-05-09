var databaseURL   = "https://seattle-angels.firebaseio.com/";
var myFirebaseRef = new Firebase(databaseURL);

var companyBriefsHTML 		= "";
var entrepreneurBriefsHTML	= "";
var investorBriefsHTML		= "";
var companyDetailsHTML		= "";
var companyDetailDivTags	= {}
var outerNavigationHTML 	= "";
var messageFromJohnHTML		= ""
const USER_SEES_OUTER_NAVIGATION 	= 0
const USER_SEES_COMPANY_BRIEFS   	= 1
const USER_SEES_COMPANY_DETAILS  	= 2
const USER_SEES_ENTREPRENEUR_BRIEFS	= 3
const USER_SEES_INVESTOR_BRIEFS  	= 4
const USER_SEES_MESSAGE_FROM_JOHN	= 5
var whereAmI	= USER_SEES_MESSAGE_FROM_JOHN
var currentlyDisplayedDetailDivTag = ""

function plainTextToHtml(toConvert)
{
	var calcS = toConvert;
	while (calcS.indexOf('\n') != -1)
		calcS = calcS.replace("\n","</div><div>");
	return "<div>" + calcS + "</div>"
}

function viewLessDetail()
{
	var whichPage
	switch (whereAmI)
	{
		case USER_SEES_COMPANY_BRIEFS: 		whereAmI = USER_SEES_OUTER_NAVIGATION; 	whichPage =  0; break;
		case USER_SEES_COMPANY_DETAILS: 	whereAmI = USER_SEES_COMPANY_BRIEFS;   	whichPage = -1; break;
		case USER_SEES_ENTREPRENEUR_BRIEFS: whereAmI = USER_SEES_OUTER_NAVIGATION;  whichPage =  1; break;
		case USER_SEES_INVESTOR_BRIEFS:		whereAmI = USER_SEES_OUTER_NAVIGATION;  whichPage =  2; break;
		case USER_SEES_OUTER_NAVIGATION: 	whereAmI = USER_SEES_MESSAGE_FROM_JOHN;	whichPage = -1; break;
		case USER_SEES_MESSAGE_FROM_JOHN:	whereAmI = USER_SEES_MESSAGE_FROM_JOHN; whichPage = -1; break;
	}
	displayPage(whichPage)
}

function viewMoreDetail(whichPage)
{
	console.log("sanityTest0")	
	console.log("whichPage = " + whichPage + ", whereAmI = " + whereAmI)
	var calc;
	if (whichPage != -1 )										{console.log("L"); calc = whichPage}
	else if (document.getElementById('theswipelist') == null)	{console.log("M"); calc = 0}
	else														{console.log("N"); calc = document.getElementById('theswipelist').selected}
	switch (whereAmI)
	{
		case USER_SEES_COMPANY_BRIEFS: 		whereAmI = USER_SEES_COMPANY_DETAILS; 		break;
		case USER_SEES_COMPANY_DETAILS: 	whereAmI = USER_SEES_COMPANY_DETAILS;  		break;
		case USER_SEES_ENTREPRENEUR_BRIEFS: whereAmI = USER_SEES_ENTREPRENEUR_BRIEFS;  	break;
		case USER_SEES_INVESTOR_BRIEFS:		whereAmI = USER_SEES_INVESTOR_BRIEFS;  		break;
		case USER_SEES_MESSAGE_FROM_JOHN:	whereAmI = USER_SEES_OUTER_NAVIGATION; 		break;
		case USER_SEES_OUTER_NAVIGATION: 	
			switch (document.getElementById('theswipelist').selected)
			{
				case 0: whereAmI = USER_SEES_COMPANY_BRIEFS;		break;
				case 1:	whereAmI = USER_SEES_ENTREPRENEUR_BRIEFS;	break;
				case 2:	whereAmI = USER_SEES_INVESTOR_BRIEFS;		break;
			}
			break;
	}
	console.log("sanityTest1")
	console.log("whichPage = " + whichPage + ", calc = " + calc + ", whereAmI = " + whereAmI)
	displayPage(calc)
}

function displayPage(whichPage)
{
	var calc;
	var calcS;
	console.log("sanityTest2")
	if (whichPage != -1) 										calc = whichPage
	else if (document.getElementById('theswipelist') == null)	calc = 0; 
	else														calc = document.getElementById('theswipelist').selected;

	switch(whereAmI)
	{
		case USER_SEES_COMPANY_DETAILS: 	calcS = companyDetailsHTML; 	break;
		case USER_SEES_COMPANY_BRIEFS: 		calcS = companyBriefsHTML;		break;
		case USER_SEES_OUTER_NAVIGATION: 	calcS = outerNavigationHTML;	break;
		case USER_SEES_ENTREPRENEUR_BRIEFS:	calcS = entrepreneurBriefsHTML; break;
		case USER_SEES_INVESTOR_BRIEFS:		calcS = investorBriefsHTML;		break;
		case USER_SEES_MESSAGE_FROM_JOHN:	calcS = messageFromJohnHTML;	break;
	}
	console.log("WAT" + calcS)
	document.getElementById('swipe_pages_div').innerHTML = calcS
	if (document.getElementById('theswipelist') != null)
		document.getElementById('theswipelist').setAttribute('selected', calc)
}

function sortOnOrder(toSort)
{
	var toSortCopy = {}
	var sortedCopy = []
	var field;
	for (field in toSort)
		toSortCopy[field] = toSort[field]
	
	for (field in toSortCopy)
	{
		if (! 'order' in toSortCopy[field])
		{
			delete toSortCopy[field]
			throw "ERROR: Could not find an 'order' subkey in '" + field + "' key!"
		}
		if (! 'content' in toSortCopy[field])
		{
			delete toSortCopy[field]
			throw "ERROR: Could not find a 'content' subkey in '" + field + "' key!"
	}	}
	
	var ii = 0
	while (Object.keys(toSortCopy).length > 0)
	{
		var orderToBeat = Number.MAX_VALUE
		var lowField = ""
		for (field in toSortCopy)
			if (toSortCopy[field]['order'] < orderToBeat)
			{
				orderToBeat = toSortCopy[field]['order']
				lowField = field
			}
		
		//because {lowField : toSortCopy[lowField]['content']} doesn't work. Javascript sure is a great language!		
		sortedCopy[ii] = {} 
		sortedCopy[ii][lowField] = toSortCopy[lowField]['content']

		delete toSortCopy[lowField]
		ii += 1
	}
	
	return sortedCopy
}

function createSwipePage(type, entryData, entryAddress)
{
	var field;
	
	var  leftPane = ""
	var rightPane = ""
	var calcS;			
	var cardTitle = entryData['Title']
	var titlePane = "<div style=\"font-weight:bold;font-size:150%;\">" + cardTitle + "</div>"
	var entryImage = ""
	for (styleType in entryData)
	{
		for (title in entryData[styleType])
		{
			switch(styleType)
			{
				case 'CompanyDetailedHeading': case 'CompanyBriefHeading':
					if (title != '<+Untitled+>')
						leftPane 	+= "<div style=\"font-weight:bold;\">" 	+ title 										+ "</div>"
					leftPane 		+= "<div>" 							   	+ plainTextToHtml(entryData[styleType][title]) 	+ "</div>"
					break;					
				case 'CompanyBriefBody': 
					rightPane	+= "<div style=\"font-weight:bold;\">"		+ title 										+ "</div>"
					rightPane	   	+= "<div>" 							  	+ plainTextToHtml(entryData[styleType][title]) 	+ "</div>"
					break;
				case 'CompanyDetailedBody':
					companyDetailDivTags[name] = {}
					var thisDivTag = entryAddress + "/" + styleType + "/" + title + "_detail_div"
					rightPane +=	"<div>"																					+
										"<button  style=\"color:blue;\"" 		 											+
												 "onclick=\"displayDetailParagraph(&quot;" + thisDivTag	+ "&quot;)\">" 		+
														title																+
										"</button>"																			+
										"<div id=\"" + name + "_" + title + "detail_div" + "\" style=\"display:none;\">" 	+
											plainTextToHtml(entryData[styleType][title])									+
										 "</div>" 																			+
									"</div>";
						companyDetailDivTags[name][title] = thisDivTag
					break;
				case 'EntrepreneurHeading': 
					if (title != '<+Untitled+>') 
						leftPane 	+= "<div style=\"font-weight:bold;\">" + title + "</div>"
					leftPane		+= "<div>" + plainTextToHtml(entryData[styleType][title]) + "</div>"
					break;	
				case 'CompanyBriefLogo': case 'CompanyDetailedLogo':
					var thisImgID = entryAddress + "/" + styleType + "/" + title + "_loaded_image"
					var loadedImage = new Image()
					

					loadedImage.src = entryData[styleType][title]
					
					titlePane += "<div style=\"height: 100px\">" 						+
								  	"<img src=\"" + entryData[styleType][title] 		+ 
								  	  "\" style=\"max-height: 100%; max-width: 100%\">"	+
								  "</div>"
					break;
	}	}	}

	return		"<swipe-page class=\"swipe\" id=\"" + name + "_swipe_page\">"  																						+
					"<div>"																																			+
						titlePane																																	+
						"<div style=\"width:45%;min-width:300px;margin:0px;padding:3px;box-sizing:content-box;background-color:grey;\"  id= \"leftPane\">"			+
							leftPane 																																+
						"</div>"																																	+
						"<div style=\"width:45%;min-width:300px;margin:0px;padding:3px;box-sizing:content-box;\"  id= \"rightPane\">"								+	//float:left; ? and float:right?
							rightPane 																																+
						"</div>"																																	+
					"<div style=\"clear:both;\"></div>"																											+
				"</div></swipe-page>" 	
}
	

function createSwipePagesHTML(databaseReply)
{
	var companySummaryHTML 				= "<img src=\"img/SACA3.png\">" 
	var entrepreneurSummaryHTML			= "<img src=\"img/SACA3.png\">" 
	var investorSummaryHTML				= "<img src=\"img/SACA3.png\">" 
	outerNavigationHTML 				= ""
	companyDetailDivTags				= {}
	var entryPath						= ""
	var cardType						= ""
	var entryNumber						= 0
	var entryData						= {}
	var entry							= ""
	var currentlySelectedSwipePage;
	
	companyDetailsHTML 		= 	"<swipe-pages id=\"theswipelist\" transitionDuration=\"0.3\">" 
	companyBriefsHTML 		= 	"<swipe-pages id=\"theswipelist\" transitionDuration=\"0.3\">"
	entrepreneurBriefsHTML 	= 	"<swipe-pages id=\"theswipelist\" transitionDuration=\"0.3\">"
//	investorBriefsHTML 		= 	"<swipe-pages id=\"theswipelist\" transitionDuration=\"0.3\">" 

	for (entry in databaseReply.val()['SAC_9'])
	{
		for (entryNumber in databaseReply.val()['SAC_9'][entry])
		{
			for (cardType in databaseReply.val()['SAC_9'][entry][entryNumber])
			{
				entryPath =                    "/SAC_9/" + entry + "/" + entryNumber + "/" + cardType
				entryData = databaseReply.val()['SAC_9']  [entry]       [entryNumber]       [cardType]
				switch(cardType) 
				{
					case 'CompanyDetailedCard': 	
						companyDetailsHTML 		+= createSwipePage(cardType, entryData, entryPath); 
						break;
					case 'CompanyBriefCard': 		
						companyBriefsHTML 		+= createSwipePage(cardType, entryData, entryPath); 
						companySummaryHTML +=	"<div>"																					+
													"<button  style=\"color:blue;\"" 													+ 
															 "onclick=\"viewMoreDetail(" + entryNumber + ")\">" 						+ 
															 	databaseReply.val()['SAC_9'][entry][entryNumber][cardType]['Title'] 	+ 
												"</button></div>";
						break;
					case 'EntrepreneurCard':		
						entrepreneurBriefsHTML 	+= createSwipePage(cardType, entryData, entryPath); 
						entrepreneurSummaryHTML +=	"<div>"																				+
														"<button  style=\"color:blue;\"" 												+ 
																 "onclick=\"viewMoreDetail(" + entryNumber + ")\">" 					+ 
																 	databaseReply.val()['SAC_9'][entry][entryNumber][cardType]['Title'] + 
													"</button></div>";
						break;
//				case 'InvestorCard':			
//					investorBriefsHTM	 	+= createSwipePage2(cardType, databaseReply.val()['SAC_9'][entry][cardType]); 
//					if (calcS2.length == 0)    {investorSummaryHTML +=	"<div>" + name + "</div>"; entryCount -=1;}
//					else						investorSummaryHTML +=	"<div><button  style=\"color:blue;\"onclick=\"viewMoreDetail(" + entryCount + ")\">" + name + "</button></div>"
//					break;
	}	}	}	}
	
	companyDetailsHTML 		+= 	"</swipe-pages>"
	companyBriefsHTML  		+= 	"</swipe-pages>"
	entrepreneurBriefsHTML	+=	"</swipe-pages>"
	investorBriefsHTML		+=  "</swipe-pages>"
	
	if (document.getElementById('theswipelist') != null)	currentlySelectedSwipePage = document.getElementById('theswipelist').selected
	else 													currentlySelectedSwipePage = 0
	
	outerNavigationHTML		= 	"<swipe-pages id=\"theswipelist\" selected=\"" + 0 + "\" transitionDuration=\"0.3\">"	+
									"<swipe-page class=\"swipe\">" 														+ 
										"<div style=\"font-weight:bold;\">Companies</div>"								+ 
										companySummaryHTML 																+ 
									"</swipe-page>"																		+
									"<swipe-page class=\"swipe\">" 														+ 
										"<div style=\"font-weight:bold;\">Entrepreneurs</div>"							+
										entrepreneurSummaryHTML 														+ 
									"</swipe-page>"																		+
//									"<swipe-page class=\"swipe\">" 														+ 
//										"<div style=\"font-weight:bold;\">Investors</div>"								+
//										investorSummaryHTML	 															+ 
//									"</swipe-page>"																		+
								"</swipe-pages>"
								
	messageFromJohnHTML		=	"<img src=\"img/SACA3.png\"></img>"			+
								"<div>" 									+ 
									databaseReply.val()['MessageFromJohn'] 	+
								"</div>"
	
	displayPage();	
	
}

function displayDetailParagraph(company, divTagOfInterest)
{
	console.log(divTagOfInterest)
	var calcO = document.getElementById(divTagOfInterest).style
	
	if (calcO['display'] == 'inline')
		calcO['display'] = 'none' //JET the user is turning off this block of text
		
	else
	{
		for (divTag in companyDetailDivTags[company])
		{
			calcO = document.getElementById(companyDetailDivTags[company][divTag]).style
			calcO['display'] = 'none';
			
		}	
		calcO = document.getElementById(divTagOfInterest).style
		calcO['display'] = 'inline';
	}
	//JET strange voodoo required by swipe-pages in order to display content that changes out from under you
	document.getElementById('theswipelist').refresh()
}

function displayDetailParagraph2(divTagOfInterest)
{
	var calcO = document.getElementById(divTagOfInterest).style
	
	if (calcO['display'] == 'inline')
		calcO['display'] = 'none' //JET the user is turning off this block of text
	else
	{
		if (currentlyDisplayedDetailDivTag.length != 0)
			document.getElementById(currentlyDisplayedDetailDivTag).style['display'] = 'none'
		calcO['display'] = 'inline'
		
	}
	currentlyDisplayedDetailDivTag = divTagOfInterest
	//JET strange voodoo required by swipe-pages in order to display content that changes out from under you
	document.getElementById('theswipelist').refresh()
}


function initialize()
{
	document.body.innerHTML = loadPage("display_window.html");
	//JET do I need to be listening for other event types? I want to know if _anything_ changes. Do I need to be listening to each event individually?
	myFirebaseRef.child("/").on("value", createSwipePagesHTML); 
}

//http://stackoverflow.com/questions/18930361/how-to-load-another-html-file-using-js
function loadPage(href)
{
	var xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", href, false); //JET some debuggers claim calling this .open asychonously (with a "false" value) is bad for performance? (shrug)
    xmlhttp.send();
 	return xmlhttp.responseText;
}


//document.addEventListener("DOMContentLoaded", function() {
//  initialize();
//});

