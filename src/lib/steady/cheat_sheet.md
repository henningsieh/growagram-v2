


1. API Key Authentication (for administrative access)
curl -X GET "https://steadyhq.com/api/v1/subscriptions" -H "x-api-key: ysp4xial0P8bfC_-QuGdcS6jSuvqRi1MLCiotzel0h6gZ04lTSv805kYHW46cLv-"

2. OAuth with Callback
https://steadyhq.com/de/oauth/authorize?client_id=96a8ccaa-190f-4d35-8820-cad054d9eaed&response_type=code&redirect_uri=https://growagram.com&scope=read_subscriptions&state=weicuzvqweocuvqwecuzv

redirects me to: https://growagram.com/de?code=R0c3aDNGcHdoeWpjNk5OMnV3Sm50dz09&state=weicuzvqweocuvqwecuzv

3. Requests the access token

 curl -X POST "https://steadyhq.com/api/v1/oauth/token" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     -d '{
           "client_id": "96a8ccaa-190f-4d35-8820-cad054d9eaed",
           "client_secret": "MUpkZXNyakVMWElVSnNMbmRuRVdodz09",
           "grant_type": "authorization_code",
           "code": "R0c3aDNGcHdoeWpjNk5OMnV3Sm50dz09",
           "redirect_uri": "https://growagram.com"
         }'\

  response / result:  {"info":{"id":"56adb32a-a347-4388-b4a6-8113421b8859","email":"henning@sieh.org","first-name":"Henning","last-name":"S."},"scope":"read","access_token":"Zm5kTkpVaC9TVWNpV0tTa2ExTUpTUT09","refresh_token":"SUJGTlZDaThzN0tVbENNM0xuNUxoUT09","expires_in":604800,"token_type":"bearer","refresh_token_expires_in":31536000}

4.1 GET /subscriptions: Returns an array with all current subscriptions of the publication.

  curl -X GET "https://steadyhq.com/api/v1/subscriptions"      -H "Authorization: Bearer Zm5kTkpVaC9TVWNpV0tTa2ExTUpTUT09"      -H "x-api-key: ysp4xial0P8bfC_-QuGdcS6jSuvqRi1MLCiotzel0h6gZ04lTSv805kYHW46cLv-" | jq .

  response / result:  {
                        "data": [
                          {
                            "attributes": {
                              "state": "not_renewing",
                              "period": "monthly",
                              "currency": "EUR",
                              "inserted-at": "2024-05-26T14:23:35.931322Z",
                              "monthly-amount": 350,
                              "monthly-amount-in-cents": 350,
                              "updated-at": "2024-12-28T06:22:48.205272Z",
                              "cancelled-at": "2024-12-28T06:22:48.205223Z",
                              "expires-at": "2025-01-26T14:23:36.000000Z",
                              "trial-ends-at": null,
                              "utm-campaign": null,
                              "active-from": "2024-05-26T14:23:35.703444Z",
                              "is-gift": false,
                              "rss-feed-url": "https://steadyhq.com/rss/growagram?auth=a9b461bd-b65e-426c-bf10-8580ac9b2ed4"
                            },
                            "id": "2b5ad9b1-c49c-4899-9f1e-457fa321a41f",
                            "type": "subscription",
                            "relationships": {
                              "plan": {
                                "data": {
                                  "id": "96fb5e3b-0fa2-47a1-84db-383cea778889",
                                  "type": "plan"
                                }
                              },
                              "subscriber": {
                                "data": {
                                  "id": "1a362285-3236-4fce-90a3-c7a19a9ffa46",
                                  "type": "user"
                                }
                              }
                            }
                          },
                          {
                            "attributes": {
                              "state": "active",
                              "period": "annual",
                              "currency": "EUR",
                              "inserted-at": "2024-05-28T07:55:21.371529Z",
                              "monthly-amount": 750,
                              "monthly-amount-in-cents": 750,
                              "updated-at": "2024-05-28T07:55:22.446115Z",
                              "cancelled-at": null,
                              "expires-at": null,
                              "trial-ends-at": null,
                              "utm-campaign": null,
                              "active-from": "2024-05-28T07:55:21.102334Z",
                              "is-gift": false,
                              "rss-feed-url": "https://steadyhq.com/rss/growagram?auth=856343f3-7141-4167-a1f0-68d3be140b79"
                            },
                            "id": "385e0dda-1a00-451b-a692-0bbd483299c4",
                            "type": "subscription",
                            "relationships": {
                              "plan": {
                                "data": {
                                  "id": "2c5f1c61-7d6b-45b6-ad8f-8f1d006bc828",
                                  "type": "plan"
                                }
                              },
                              "subscriber": {
                                "data": {
                                  "id": "72f0d27e-c04f-4521-a9da-5cebb0609176",
                                  "type": "user"
                                }
                              }
                            }
                          },
                          {
                            "attributes": {
                              "state": "active",
                              "period": "annual",
                              "currency": "EUR",
                              "inserted-at": "2024-05-29T09:00:58.239778Z",
                              "monthly-amount": 750,
                              "monthly-amount-in-cents": 750,
                              "updated-at": "2024-05-29T09:01:01.113478Z",
                              "cancelled-at": null,
                              "expires-at": null,
                              "trial-ends-at": null,
                              "utm-campaign": null,
                              "active-from": "2024-05-29T09:00:58.024461Z",
                              "is-gift": false,
                              "rss-feed-url": "https://steadyhq.com/rss/growagram?auth=e6327984-de2d-4bdc-b5e0-a52ebe401bea"
                            },
                            "id": "12fcb46c-55de-40e4-9698-ab79ac983df3",
                            "type": "subscription",
                            "relationships": {
                              "plan": {
                                "data": {
                                  "id": "2c5f1c61-7d6b-45b6-ad8f-8f1d006bc828",
                                  "type": "plan"
                                }
                              },
                              "subscriber": {
                                "data": {
                                  "id": "b494b122-cb39-4f78-a536-73ebc25bd82f",
                                  "type": "user"
                                }
                              }
                            }
                          },
                          {
                            "attributes": {
                              "state": "active",
                              "period": "annual",
                              "currency": "EUR",
                              "inserted-at": "2024-05-28T11:03:39.630608Z",
                              "monthly-amount": 750,
                              "monthly-amount-in-cents": 750,
                              "updated-at": "2024-05-28T11:03:42.307360Z",
                              "cancelled-at": null,
                              "expires-at": null,
                              "trial-ends-at": null,
                              "utm-campaign": null,
                              "active-from": "2024-05-28T11:03:39.421701Z",
                              "is-gift": false,
                              "rss-feed-url": "https://steadyhq.com/rss/growagram?auth=e4bd218f-5a56-4caa-a596-f7bb74462ebc"
                            },
                            "id": "1d3646fd-02b3-458c-af92-d0890371684e",
                            "type": "subscription",
                            "relationships": {
                              "plan": {
                                "data": {
                                  "id": "2c5f1c61-7d6b-45b6-ad8f-8f1d006bc828",
                                  "type": "plan"
                                }
                              },
                              "subscriber": {
                                "data": {
                                  "id": "5db9d4ee-1a59-4330-88e9-571175b7bb50",
                                  "type": "user"
                                }
                              }
                            }
                          },
                          {
                            "attributes": {
                              "state": "active",
                              "period": "annual",
                              "currency": "EUR",
                              "inserted-at": "2024-05-26T14:08:11.600189Z",
                              "monthly-amount": 300,
                              "monthly-amount-in-cents": 300,
                              "updated-at": "2024-05-26T14:08:13.933343Z",
                              "cancelled-at": null,
                              "expires-at": null,
                              "trial-ends-at": null,
                              "utm-campaign": null,
                              "active-from": "2024-05-26T14:08:11.398580Z",
                              "is-gift": false,
                              "rss-feed-url": "https://steadyhq.com/rss/growagram?auth=fd620642-b151-47bb-84dd-1e53f1ba463f"
                            },
                            "id": "00b28b3d-73fc-454b-86e7-c4a854b894b0",
                            "type": "subscription",
                            "relationships": {
                              "plan": {
                                "data": {
                                  "id": "96fb5e3b-0fa2-47a1-84db-383cea778889",
                                  "type": "plan"
                                }
                              },
                              "subscriber": {
                                "data": {
                                  "id": "1ea846f9-3f67-468f-ad0a-a0c3a2801711",
                                  "type": "user"
                                }
                              }
                            }
                          },
                          {
                            "attributes": {
                              "state": "active",
                              "period": "annual",
                              "currency": "EUR",
                              "inserted-at": "2024-05-26T16:58:54.678807Z",
                              "monthly-amount": 420,
                              "monthly-amount-in-cents": 420,
                              "updated-at": "2024-05-26T16:58:56.864867Z",
                              "cancelled-at": null,
                              "expires-at": null,
                              "trial-ends-at": null,
                              "utm-campaign": null,
                              "active-from": "2024-05-26T16:58:54.453245Z",
                              "is-gift": false,
                              "rss-feed-url": "https://steadyhq.com/rss/growagram?auth=cb6e1042-88da-40bc-8d77-beb9606064b3"
                            },
                            "id": "50422b4b-8331-4eba-927b-6799ea2d8452",
                            "type": "subscription",
                            "relationships": {
                              "plan": {
                                "data": {
                                  "id": "a3429e5a-ffc2-4902-8161-184912fddbd6",
                                  "type": "plan"
                                }
                              },
                              "subscriber": {
                                "data": {
                                  "id": "973cfbb7-05f6-4df2-b3e5-a54b93eed646",
                                  "type": "user"
                                }
                              }
                            }
                          }
                        ],
                        "included": [
                          {
                            "attributes": {
                              "hidden": false,
                              "name": "Standard-Mitgliedschaft",
                              "state": "published",
                              "currency": "EUR",
                              "giftable": true,
                              "benefits": "Komm in die Gruppe! ✌️\r\n\r\n(Info: dies ist der niedrigste Preis, den Steady zulässt.)",
                              "inserted-at": "2024-05-24T11:08:05.108891Z",
                              "monthly-amount": 350,
                              "monthly-amount-in-cents": 350,
                              "updated-at": "2024-05-26T07:06:15.505711Z",
                              "annual-amount": 3600,
                              "annual-amount-in-cents": 3600,
                              "ask-for-shiping-address": false,
                              "countdown-enabled": false,
                              "countdown-ends-at": null,
                              "goal-enabled": false,
                              "image-url": "https://assets.steadyhq.com/production/plan/96fb5e3b-0fa2-47a1-84db-383cea778889/image/1716644253?auto=format&h=150&w=300&fit=crop&fm=jpg&crop=faces",
                              "subscription-guests-max-count": null,
                              "subscriptions-goal": null
                            },
                            "id": "96fb5e3b-0fa2-47a1-84db-383cea778889",
                            "type": "plan"
                          },
                          {
                            "attributes": {
                              "hidden": false,
                              "name": "Hoodie Gönner Paket 🤑",
                              "state": "published",
                              "currency": "EUR",
                              "giftable": true,
                              "benefits": "Für dieses Paket bekommst du einen GrowAGram-Hoodie in Farbe und Größe deiner Wahl.  😍\r\n\r\n(ACHTUNG: bei monatlicher Beitragszahlung bekommst du den Hoodie auf Vertrauensbasis im 6. Monat!)",
                              "inserted-at": "2024-05-24T15:53:25.579993Z",
                              "monthly-amount": 950,
                              "monthly-amount-in-cents": 950,
                              "updated-at": "2024-05-26T06:55:13.953398Z",
                              "annual-amount": 9000,
                              "annual-amount-in-cents": 9000,
                              "ask-for-shiping-address": true,
                              "countdown-enabled": false,
                              "countdown-ends-at": null,
                              "goal-enabled": false,
                              "image-url": "https://assets.steadyhq.com/production/plan/2c5f1c61-7d6b-45b6-ad8f-8f1d006bc828/image/1716702543?auto=format&h=150&w=300&fit=crop&fm=jpg&crop=faces",
                              "subscription-guests-max-count": null,
                              "subscriptions-goal": null
                            },
                            "id": "2c5f1c61-7d6b-45b6-ad8f-8f1d006bc828",
                            "type": "plan"
                          },
                          {
                            "attributes": {
                              "hidden": false,
                              "name": "Unterstützer-Mitgliedschaft",
                              "state": "published",
                              "currency": "EUR",
                              "giftable": true,
                              "benefits": "Vielen Dank für deine Unterstützung und dein Vertrauen! 😃",
                              "inserted-at": "2024-05-24T16:18:45.165370Z",
                              "monthly-amount": 500,
                              "monthly-amount-in-cents": 500,
                              "updated-at": "2024-05-26T05:39:10.271478Z",
                              "annual-amount": 5040,
                              "annual-amount-in-cents": 5040,
                              "ask-for-shiping-address": false,
                              "countdown-enabled": false,
                              "countdown-ends-at": null,
                              "goal-enabled": false,
                              "image-url": "https://assets.steadyhq.com/production/plan/a3429e5a-ffc2-4902-8161-184912fddbd6/image/1716645055?auto=format&h=150&w=300&fit=crop&fm=jpg&crop=faces",
                              "subscription-guests-max-count": null,
                              "subscriptions-goal": null
                            },
                            "id": "a3429e5a-ffc2-4902-8161-184912fddbd6",
                            "type": "plan"
                          },
                          {
                            "attributes": {
                              "email": "resound@freudenkinder.de",
                              "avatar-url": "https://assets.steadyhq.com/gfx/brand2019/defaults/user/avatar-2.png?auto=format&mask=ellipse&h=200&w=200&fit=crop&fm=png&crop=faces",
                              "first-name": "Steffen",
                              "last-name": "Kramer"
                            },
                            "id": "1a362285-3236-4fce-90a3-c7a19a9ffa46",
                            "type": "user"
                          },
                          {
                            "attributes": {
                              "email": "s-runge88@web.de",
                              "avatar-url": "https://assets.steadyhq.com/gfx/brand2019/defaults/user/avatar-2.png?auto=format&mask=ellipse&h=200&w=200&fit=crop&fm=png&crop=faces",
                              "first-name": "Sebastian",
                              "last-name": "Derdulla"
                            },
                            "id": "72f0d27e-c04f-4521-a9da-5cebb0609176",
                            "type": "user"
                          },
                          {
                            "attributes": {
                              "email": "wiseclown@gmail.com",
                              "avatar-url": "https://assets.steadyhq.com/production/user/b494b122-cb39-4f78-a536-73ebc25bd82f/avatar/1716973108?auto=format&mask=ellipse&h=200&w=200&fit=crop&fm=png&crop=faces",
                              "first-name": "Christian",
                              "last-name": "Steiauf"
                            },
                            "id": "b494b122-cb39-4f78-a536-73ebc25bd82f",
                            "type": "user"
                          },
                          {
                            "attributes": {
                              "email": "carpe-noctem2@gmx.net",
                              "avatar-url": "https://assets.steadyhq.com/gfx/brand2019/defaults/user/avatar-2.png?auto=format&mask=ellipse&h=200&w=200&fit=crop&fm=png&crop=faces",
                              "first-name": "Martin",
                              "last-name": "Kraus"
                            },
                            "id": "5db9d4ee-1a59-4330-88e9-571175b7bb50",
                            "type": "user"
                          },
                          {
                            "attributes": {
                              "email": "claragabriel@gmx.de",
                              "avatar-url": "https://assets.steadyhq.com/gfx/brand2019/defaults/user/avatar-2.png?auto=format&mask=ellipse&h=200&w=200&fit=crop&fm=png&crop=faces",
                              "first-name": "Clara",
                              "last-name": "Gabriel"
                            },
                            "id": "1ea846f9-3f67-468f-ad0a-a0c3a2801711",
                            "type": "user"
                          },
                          {
                            "attributes": {
                              "email": "6t2bc2qc9w@privaterelay.appleid.com",
                              "avatar-url": "https://assets.steadyhq.com/gfx/brand2019/defaults/user/avatar-2.png?auto=format&mask=ellipse&h=200&w=200&fit=crop&fm=png&crop=faces",
                              "first-name": "Paul",
                              "last-name": "Kempe"
                            },
                            "id": "973cfbb7-05f6-4df2-b3e5-a54b93eed646",
                            "type": "user"
                          }
                        ]
                      }

4.2 GET /subscriptions/me: Returns infos about the current subscription for the user associated with the access token. If the user has no subscription, or it has expired, the data attribute of the response is null.

Requesting the owner's subscription for his own steady 
  project (makes no sense but data seems to be legit):

  curl -X GET "https://steadyhq.com/api/v1/subscriptions/me"      -H "Authorization: Bearer Zm5kTkpVaC9TVWNpV0tTa2ExTUpTUT09"      -H "x-api-key: ysp4xial0P8bfC_-QuGdcS6jSuvqRi1MLCiotzel0h6gZ04lTSv805kYHW46cLv-" |

  {
    "data": null
  }


Here is a mocked example response for User "claragabriel@gmx.de":

{
  "data": [
    {
      "attributes": {
        "state": "active",
        "period": "annual",
        "currency": "EUR",
        "inserted-at": "2024-05-26T14:08:11.600189Z",
        "monthly-amount": 300,
        "monthly-amount-in-cents": 300,
        "updated-at": "2024-05-26T14:08:13.933343Z",
        "active-from": "2024-05-26T14:08:11.398580Z",
        "cancelled-at": null,
        "expires-at": null,
        "is-gift": false,
        "rss-feed-url": "https://steadyhq.com/rss/growagram?auth=fd620642-b151-47bb-84dd-1e53f1ba463f",
        "trial-ends-at": null,
        "utm-campaign": null
      },
      "id": "00b28b3d-73fc-454b-86e7-c4a854b894b0",
      "type": "subscription",
      "relationships": {
        "plan": {
          "data": {
            "id": "96fb5e3b-0fa2-47a1-84db-383cea778889",
            "type": "plan"
          }
        },
        "subscriber": {
          "data": {
            "id": "1ea846f9-3f67-468f-ad0a-a0c3a2801711",
            "type": "user"
          }
        }
      }
    }
  ],
  "included": [
    {
      "attributes": {
        "hidden": false,
        "name": "Standard-Mitgliedschaft",
        "state": "published",
        "currency": "EUR",
        "giftable": true,
        "benefits": "Komm in die Gruppe! ✌️\r\n\r\n(Info: dies ist der niedrigste Preis, den Steady zulässt.)",
        "annual-amount": 3600,
        "annual-amount-in-cents": 3600,
        "ask-for-shiping-address": false,
        "countdown-enabled": false,
        "countdown-ends-at": null,
        "goal-enabled": false,
        "image-url": "https://assets.steadyhq.com/production/plan/96fb5e3b-0fa2-47a1-84db-383cea778889/image/1716644253?auto=format&h=150&w=300&fit=crop&fm=jpg&crop=faces",
        "inserted-at": "2024-05-24T11:08:05.108891Z",
        "monthly-amount": 350,
        "monthly-amount-in-cents": 350,
        "subscription-guests-max-count": null,
        "subscriptions-goal": null,
        "updated-at": "2024-05-26T07:06:15.505711Z"
      },
      "id": "96fb5e3b-0fa2-47a1-84db-383cea778889",
      "type": "plan"
    },
    {
      "attributes": {
        "email": "claragabriel@gmx.de",
        "first-name": "Clara",
        "last-name": "Gabriel",
        "avatar-url": "https://assets.steadyhq.com/gfx/brand2019/defaults/user/avatar-2.png?auto=format&mask=ellipse&h=200&w=200&fit=crop&fm=png&crop=faces"
      },
      "id": "1ea846f9-3f67-468f-ad0a-a0c3a2801711",
      "type": "user"
    }
  ]
}

