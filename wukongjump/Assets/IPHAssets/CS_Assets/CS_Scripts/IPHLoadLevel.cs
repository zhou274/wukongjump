#if UNITY_5_3
using UnityEngine.SceneManagement;
#endif

using UnityEngine;
using TTSDK.UNBridgeLib.LitJson;
using TTSDK;
using StarkSDKSpace;
using System.Collections.Generic;

namespace InfiniteHopper
{
	/// <summary>
	/// Includes functions for loading levels and URLs. It's intended for use with UI Buttons
	/// </summary>
	public class IPHLoadLevel:MonoBehaviour
	{
        /// <summary>
        /// Loads the URL.
        /// </summary>
        /// <param name="urlName">URL/URI</param>
        public string clickid;
        private StarkAdManager starkAdManager;
        public void LoadURL(string urlName)
		{
			Application.OpenURL(urlName);
		}
	
		/// <summary>
		/// Loads the level.
		/// </summary>
		/// <param name="levelName">Level name.</param>
		public void LoadLevel(string levelName)
		{
			#if UNITY_5_3
			SceneManager.LoadScene(levelName);
			#else
			Application.LoadLevel(levelName);
			#endif
		}

		/// <summary>
		/// Restarts the current level.
		/// </summary>
		public void RestartLevel()
		{
            //#if UNITY_5_3
            //			SceneManager.LoadScene(SceneManager.GetActiveScene().name);
            //#else
            ShowVideoAd("e7i7c19867g187d5ne",
            (bol) => {
                if (bol)
                {

                    IPHGameController.isCotinue = true;
                    Application.LoadLevel(Application.loadedLevelName);


                    clickid = "";
                    getClickid();
                    apiSend("game_addiction", clickid);
                    apiSend("lt_roi", clickid);


                }
                else
                {
                    StarkSDKSpace.AndroidUIManager.ShowToast("观看完整视频才能获取奖励哦！");
                }
            },
            (it, str) => {
                Debug.LogError("Error->" + str);
                //AndroidUIManager.ShowToast("广告加载异常，请重新看广告！");
            });
            
			//#endif
		}
        public void getClickid()
        {
            var launchOpt = StarkSDK.API.GetLaunchOptionsSync();
            if (launchOpt.Query != null)
            {
                foreach (KeyValuePair<string, string> kv in launchOpt.Query)
                    if (kv.Value != null)
                    {
                        Debug.Log(kv.Key + "<-参数-> " + kv.Value);
                        if (kv.Key.ToString() == "clickid")
                        {
                            clickid = kv.Value.ToString();
                        }
                    }
                    else
                    {
                        Debug.Log(kv.Key + "<-参数-> " + "null ");
                    }
            }
        }

        public void apiSend(string eventname, string clickid)
        {
            TTRequest.InnerOptions options = new TTRequest.InnerOptions();
            options.Header["content-type"] = "application/json";
            options.Method = "POST";

            JsonData data1 = new JsonData();

            data1["event_type"] = eventname;
            data1["context"] = new JsonData();
            data1["context"]["ad"] = new JsonData();
            data1["context"]["ad"]["callback"] = clickid;

            Debug.Log("<-data1-> " + data1.ToJson());

            options.Data = data1.ToJson();

            TT.Request("https://analytics.oceanengine.com/api/v2/conversion", options,
               response => { Debug.Log(response); },
               response => { Debug.Log(response); });
        }


        /// <summary>
        /// </summary>
        /// <param name="adId"></param>
        /// <param name="closeCallBack"></param>
        /// <param name="errorCallBack"></param>
        public void ShowVideoAd(string adId, System.Action<bool> closeCallBack, System.Action<int, string> errorCallBack)
        {
            starkAdManager = StarkSDK.API.GetStarkAdManager();
            if (starkAdManager != null)
            {
                starkAdManager.ShowVideoAdWithId(adId, closeCallBack, errorCallBack);
            }
        }
    }

}