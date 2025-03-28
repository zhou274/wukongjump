﻿using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using InfiniteHopper.Types;

namespace InfiniteHopper
{
	/// <summary>
	///This script handles player selection. You can navigate through the available players using buttons. The currently
	///selected player is shown on screen and recorded in the PlayerPrefs record, then later retrieved in the game
	/// </summary>
	public class IPHPlayerSelection:MonoBehaviour 
	{
		//A list of players that can be unlocked with tokens
		public PlayerUnlock[] playerList;

		//The currently selected player
		public int currentPlayer = 0;
		
		//The player prefs record name of the current player. It's where we save the current player so we can load it in the level
		public string playerPrefsName = "CurrentPlayer";
		
		//The number of tokens we have
		internal float tokens = 0;
		
		//The player prefs record name of the tokens. It's where we keep record of the number of tokens we have.
		public string tokensPrefsName = "Tokens";

		internal int index = 0;
		
		//The icon that displays the number of tokens needed to unlock a character
		public Transform tokenIcon;
		
		void  Start()
		{
			//Get the number of tokens we have
			tokens = PlayerPrefs.GetFloat(tokensPrefsName, tokens);
			
			//Get the current player and change the icon accordingly
			currentPlayer = PlayerPrefs.GetInt(playerPrefsName, currentPlayer);
			
			SetPlayer(currentPlayer);
		}
		
		//This function changes the current player
		void  ChangePlayer(int changeValue)
		{
			currentPlayer += changeValue;
			
			if ( currentPlayer > playerList.Length - 1 )    currentPlayer = 0;
			if ( currentPlayer < 0 )    currentPlayer = playerList.Length - 1;
			
			SetPlayer(currentPlayer);
		}
		
		//This function activates the selected player, while deactivating all the others
		void  SetPlayer(int playerNumber)
		{
			//Go through all the players, and hide each one except the current player
			for( index = 0; index < playerList.Length; index++ )
			{
				if ( index != playerNumber )    playerList[index].playerIcon.gameObject.SetActive(false);
				else    playerList[index].playerIcon.gameObject.SetActive(true);
			}
			
			//Get all the sprite renderers in this player icon
			SpriteRenderer[] playerParts = playerList[playerNumber].playerIcon.GetComponentsInChildren<SpriteRenderer>();
			
			//If the player is unlocked, set this as the current player
			if ( tokens >= playerList[playerNumber].tokensToUnlock )
			{
				//Go through all parts of the player and turn them opaque
				foreach( SpriteRenderer part in playerParts )    part.color = new Color(part.color.r, part.color.g, part.color.b, 1);
				
				if ( tokenIcon )   
				{
					//Deactivate the token icon
					tokenIcon.gameObject.SetActive(false);
				}
				
				//Set this as the current player
				PlayerPrefs.SetInt(playerPrefsName,playerNumber);

				// Record the number of unlocked characters in PlayerPrefs
				PlayerPrefs.SetInt("CharactersUnlocked", playerNumber);
			}
			else //Otherwise, display the number of tokens needed before this character is unlocked
			{
				//Go through all parts of the player and turn them transparent
				foreach( SpriteRenderer part in playerParts )    part.color = new Color(part.color.r, part.color.g, part.color.b, 0.3f);
				
				if ( tokenIcon )   
				{
					//Activate the token icon
					tokenIcon.gameObject.SetActive(true);
					
					//Display the number of tokens needed to unlock this player
					tokenIcon.Find("Text").GetComponent<Text>().text = (playerList[playerNumber].tokensToUnlock - tokens).ToString();
				}
			}
		}
	}
}
