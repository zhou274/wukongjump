//This script handles player selection. You can navigate through the available players using buttons. The currently
//selected player is shown on screen and recorded in the PlayerPrefs record, then later retrieved in the game
#pragma strict
#pragma downcast

import UnityEngine.UI;

//A list of players that can be unlocked with tokens
var playerList:PlayerUnlock[];

public class PlayerUnlock
{
	//The icon/avatar of the player
	var playerIcon:Transform;
	
	//How many tokens are needed to unlock this player
	var tokensToUnlock:int = 5;
}

//The currently selected player
var currentPlayer:int = 0;

//The player prefs record name of the current player. It's where we save the current player so we can load it in the level
var playerPrefsName:String = "CurrentPlayer";

//The number of tokens we have
internal var tokens:float = 0;

//The player prefs record name of the tokens. It's where we keep record of the number of tokens we have.
var tokensPrefsName:String = "Tokens";

internal var index:int = 0;

//The icon that displays the number of tokens needed to unlock a character
var tokenIcon:Transform;

function Start()
{
	//Get the number of tokens we have
	tokens = PlayerPrefs.GetFloat(tokensPrefsName, tokens);
	
	//Get the current player and change the icon accordingly
	currentPlayer = PlayerPrefs.GetInt(playerPrefsName, currentPlayer);
	
	SetPlayer(currentPlayer);
}

//This function changes the current player
function ChangePlayer( changeValue:int )
{
	currentPlayer += changeValue;
	
	if ( currentPlayer > playerList.Length - 1 )    currentPlayer = 0;
	if ( currentPlayer < 0 )    currentPlayer = playerList.Length - 1;
	
	SetPlayer(currentPlayer);
}

//This function activates the selected player, while deactivating all the others
function SetPlayer( playerNumber:int )
{
	//Go through all the players, and hide each one except the current player
	for( index = 0; index < playerList.Length; index++ )
	{
		if ( index != playerNumber )    playerList[index].playerIcon.gameObject.SetActive(false);
		else    playerList[index].playerIcon.gameObject.SetActive(true);
	}
	
	//Get all the sprite renderers in this player icon
	var playerParts = playerList[playerNumber].playerIcon.GetComponentsInChildren(SpriteRenderer);
	
	//If the player is unlocked, set this as the current player
	if ( tokens >= playerList[playerNumber].tokensToUnlock )
	{
		//Go through all parts of the player and turn them opaque
		for ( var part in playerParts )    part.GetComponent(SpriteRenderer).color.a = 1;
		
		if ( tokenIcon )   
		{
			//Deactivate the token icon
			tokenIcon.gameObject.SetActive(false);
		}
		
		//Set this as the current player
		PlayerPrefs.SetInt(playerPrefsName,playerNumber);
	}
	else //Otherwise, display the number of tokens needed before this character is unlocked
	{
		//Go through all parts of the player and turn them transparent
		for ( var part in playerParts )    part.GetComponent(SpriteRenderer).color.a = 0.3;
		
		if ( tokenIcon )   
		{
			//Activate the token icon
			tokenIcon.gameObject.SetActive(true);
			
			//Display the number of tokens needed to unlock this player
			tokenIcon.Find("Text").GetComponent(Text).text = (playerList[playerNumber].tokensToUnlock - tokens).ToString();
		}
	}
}