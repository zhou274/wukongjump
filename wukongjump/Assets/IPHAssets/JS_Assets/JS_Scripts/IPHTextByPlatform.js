//This script allows the user to customize the a text string based on the platform type.
#pragma strict

//The text that will be displayed on PC/Mac/Webplayer
var computerText:String = "CLICK TO START";

//The text that will be displayed on Android/iOS/WinPhone
var mobileText:String = "TAP TO START";

//The text that will be displayed on Playstation, Xbox, Wii
var consoleText:String = "PRESS 'A' TO START";

function Start() 
{
	if ( Application.platform == RuntimePlatform.WindowsPlayer || Application.platform == RuntimePlatform.OSXPlayer || Application.platform == RuntimePlatform.WindowsWebPlayer || Application.platform == RuntimePlatform.OSXWebPlayer || Application.platform == RuntimePlatform.OSXDashboardPlayer || Application.platform == RuntimePlatform.LinuxPlayer )
	{
		GetComponent(Text).text = computerText;
	}
	else if ( Application.platform == RuntimePlatform.IPhonePlayer || Application.platform == RuntimePlatform.Android || Application.platform == RuntimePlatform.WP8Player )
	{
		GetComponent(Text).text = mobileText;
	}
	else if ( Application.platform == RuntimePlatform.PS3 || Application.platform == RuntimePlatform.XBOX360 || Application.platform == RuntimePlatform.PS4 || Application.platform == RuntimePlatform.XboxOne )
	{
		GetComponent(Text).text = consoleText;
	}
}