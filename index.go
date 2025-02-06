package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"

	"github.com/gorilla/mux"
	"github.com/robfig/cron/v3"
)

const TELEGRAM_TOKEN = "83255752826181:AAFr2i46cjgH3mzj1nDR8uKvGKiHoDGsduEWytT"
const TELEGRAM_CHAT_ID = "753156180818249137"

func runPythonFile(fileName string, params []string) (string, error) {
	cmd := exec.Command("python", append([]string{fileName}, params...)...)
	cmd.Env = append(os.Environ(), "PYTHONIOENCODING=utf-8")
	output, err := cmd.CombinedOutput()
	return string(output), err
}

func sendTelegramMessage(chatID, message string) error {
	url := fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage?chat_id=%s&text=%s", TELEGRAM_TOKEN, chatID, message)
	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	return nil
}

func imAlive() {
	err := sendTelegramMessage(TELEGRAM_CHAT_ID, "LimeNotifier Backend Server is running well👍")
	if err != nil {
		log.Println("Error sending Telegram message:", err)
	} else {
		log.Println("Message sent!")
	}
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Type", "text/html; charset=utf-8")

	html := `<!DOCTYPE html>
			<html lang="ko">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>LimeNotifier</title>
				<style>
					body {
						margin: 0;
						padding: 0;
						background-color: #3F3F3F;
						display: flex;
						justify-content: center;
						align-items: center;
						height: 100vh;
						font-family: Arial, sans-serif;
					}
					.content {
						text-align: center;
						color: #fff;
					}
					.image {
						max-width: 300px;
						margin-bottom: 20px;
					}
				</style>
			</head>
			<body>
				<div class="content">
					<img class="image" src="/lime_ci.png" alt="LimeNotifier Logo">
					<h1>Lime Notifier</h1>
					<p>안녕하세요. Lime Notifier의 백엔드 페이지입니다.</p>
				</div>
			</body>
			</html>`

	fmt.Fprint(w, html)
}

func hotdealHandler(w http.ResponseWriter, r *http.Request) {
	output, err := runPythonFile("./python/hotdeal.py", []string{})
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]string{"result": output})
}

func currencyHandler(w http.ResponseWriter, r *http.Request) {
	params := []string{r.URL.Query().Get("url"), r.URL.Query().Get("authkey"), r.URL.Query().Get("searchdate"), r.URL.Query().Get("data")}
	output, err := runPythonFile("./python/currency.py", params)
	if err != nil {
		http.Error(w, "Internal Server Error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", "*")
	json.NewEncoder(w).Encode(map[string]string{"result": output})
}

func sendTelegramMsgHandler(w http.ResponseWriter, r *http.Request) {
	chatID := r.URL.Query().Get("chatId")
	message := r.URL.Query().Get("message")
	if err := sendTelegramMessage(chatID, message); err != nil {
		http.Error(w, "Error sending message", http.StatusInternalServerError)
		return
	}
	w.Write([]byte("Message sent!"))
}

func main() {
	r := mux.NewRouter()
	r.HandleFunc("/", homeHandler).Methods("GET")
	r.HandleFunc("/hotdeal", hotdealHandler).Methods("GET")
	r.HandleFunc("/currency", currencyHandler).Methods("GET")
	r.HandleFunc("/sendTelegramMsg", sendTelegramMsgHandler).Methods("GET")
	r.HandleFunc("/naver", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		fmt.Fprint(w, `<a href="https://naver.com">Naver Response</a>`)
	}).Methods("GET")

	http.Handle("/", r)
	log.Println("Server started on port 3001")
	go http.ListenAndServe(":3001", nil)

	c := cron.New()
	c.AddFunc("10 0 * * *", func() {
		cmd := exec.Command("/bin/sh", "script/slp_login.sh")
		if err := cmd.Run(); err != nil {
			log.Println("Error executing script:", err)
		}
	})
	c.AddFunc("30 10 * * *", imAlive)
	c.AddFunc("30 22 * * *", imAlive)
	c.Start()

	select {} // 블로킹 유지
}
