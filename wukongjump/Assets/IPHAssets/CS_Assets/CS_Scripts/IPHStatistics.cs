using UnityEngine;
using UnityEngine.UI;
using System.Collections;

public class IPHStatistics : MonoBehaviour 
{
	// Use this for initialization
	void Start() 
	{
		// Set the statistics values in the statistics canvas
		GameObject.Find("TextDistance").GetComponent<Text>().text = "LONGEST DISTANCE: " + PlayerPrefs.GetInt( "LongestDistance", 0).ToString();
		GameObject.Find("TextStreak").GetComponent<Text>().text = "LONGEST STREAK: " + PlayerPrefs.GetInt( "LongestStreak", 0).ToString();
		GameObject.Find("TextTokens").GetComponent<Text>().text = "TOTAL TOKENS: " + PlayerPrefs.GetFloat( "Tokens", 0).ToString();
		GameObject.Find("TextPowerups").GetComponent<Text>().text = "TOTAL POWERUPS: " + PlayerPrefs.GetInt( "TotalPowerups", 0).ToString();
		GameObject.Find("TextPowerupStreak").GetComponent<Text>().text = "LONGEST POWERUP: " + PlayerPrefs.GetInt( "LongestPowerup", 0).ToString();
		GameObject.Find("TextCharacters").GetComponent<Text>().text = "CHARACTERS UNLOCKED: " + PlayerPrefs.GetInt( "CharactersUnlocked", 1).ToString();
	}

}
