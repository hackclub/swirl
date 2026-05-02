package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"time"
)

var AIRTABLE_PAT = os.Getenv("AIRTABLE_PAT") // must have access to Swirl YSWS base and read permissions on table
var SWIRL_BASE_ID = os.Getenv("SWIRL_BASE_ID")
var SWIRL_TABLE_ID = os.Getenv("SWIRL_TABLE_ID")
var CDN_BASE_URL = os.Getenv("CDN_BASE_URL") // you could have this be https://cdn.hackclub.com or a tiredkangaroo/storage instance
var CDN_API_KEY = os.Getenv("CDN_API_KEY")

// list records docs: https://airtable.com/developers/web/api/list-records
// get https://api.airtable.com/v0/{baseId}/{tableIdOrName} w authorization bearer pat

type SubmissionRecord struct {
	ID          string    `json:"id"`
	CreatedTime time.Time `json:"createdTime"`
	Fields      struct {
		GithubUsername string `json:"Github Username"`
		CodeURL        string `json:"Code URL"`
		PlayableURL    string `json:"Playable URL"`
		Screenshot     []struct {
			URL string `json:"url"`
		} `json:"Screenshot"`
		Scoops       string `json:"Scoops #"`      // the endpoint returns scoops count as a string
		ReviewStatus string `json:"Review Status"` // "Rejected" or "Approved" or "Pending" or "Changes Requested"
	}
}

type Submission struct {
	GithubUsername string `json:"github_username"`
	CodeURL        string `json:"code_url"`
	PlayableURL    string `json:"playable_url"`
	Scoops         string `json:"scoops_count"`
	ScreenshotURL  string `json:"screenshot_url"`
}
type Submissions map[string]Submission

func ListRecords() ([]SubmissionRecord, error) {
	var records []SubmissionRecord
	var offset string
	for {
		// create req and add bearer auth
		req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("https://api.airtable.com/v0/%s/%s?offset=%s", SWIRL_BASE_ID, SWIRL_TABLE_ID, offset), nil)
		if err != nil {
			return nil, fmt.Errorf("create request: %w", err)
		}
		req.Header.Set("Authorization", "Bearer "+AIRTABLE_PAT)

		// do req to get response
		resp, err := http.DefaultClient.Do(req)
		if err != nil {
			return nil, fmt.Errorf("do request: %w", err)
		}
		if resp.Status[0] != '2' {
			return nil, fmt.Errorf("not a 2xx status code (status: %d)", resp.StatusCode)
		}

		// get the resp data
		var data struct {
			Offset  string             `json:"offset"`
			Records []SubmissionRecord `json:"records"`
		}
		if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
			return nil, fmt.Errorf("decode response") // not logging error bc i think it'll include part of the data
		}
		records = append(records, data.Records...)
		if data.Offset == "" {
			break
		}
		offset = data.Offset
	}

	return records, nil
}

func AirtableScreenshotToCDN(link string) (string, error) {
	data, err := json.Marshal(map[string]any{
		"url": link,
	})
	if err != nil {
		return "", fmt.Errorf("marshal: %w", err)
	}

	// do the req
	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("%s/api/v4/upload_from_url", CDN_BASE_URL), bytes.NewReader(data))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+CDN_API_KEY)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("do request: %w", err)
	}
	if resp.Status[0] != '2' {
		return "", fmt.Errorf("not a 2xx status code (status: %d)", resp.StatusCode)
	}

	var respData struct {
		URL string `json:"url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&respData); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	return respData.URL, nil
}

func loadSubmissions() (Submissions, error) {
	data, err := os.ReadFile("data.json")
	if err != nil {
		fmt.Printf("load data.json: %v, starting with empty submissions\n", err)
		return make(Submissions), nil
	}

	var submissions Submissions
	if err := json.Unmarshal(data, &submissions); err != nil {
		return nil, fmt.Errorf("unmarshal: %w", err)
	}

	return submissions, nil
}

func saveSubmissions(submissions Submissions) error {
	data, err := json.Marshal(submissions)
	if err != nil {
		return fmt.Errorf("marshal: %w", err)
	}

	if err := os.WriteFile("data.json", data, 0644); err != nil {
		return fmt.Errorf("write file: %w", err)
	}

	return nil
}

func main() {
	records, err := ListRecords()
	if err != nil {
		fmt.Printf("error listing records: %v\n", err)
		return
	}
	fmt.Printf("got %d records from airtable\n", len(records))

	submissions, err := loadSubmissions()
	if err != nil {
		fmt.Printf("error loading submissions: %v\n", err)
		return
	}
	fmt.Printf("got %d submissions from data.json\n", len(submissions))

	if len(submissions) == len(records) {
		fmt.Println("no new records to add to submissions")
		return
	}

	// steps:
	// 1. find records that are not in submissions
	// 2. for each of those records, convert the airtable screenshot to a cdn url and add to submissions
	// note: that doesn't handle a case where a record was deleted or a new screenshot was added or a record was unapproved

	for _, record := range records {
		if record.Fields.ReviewStatus != "Approved" {
			continue
		}
		if len(record.Fields.Screenshot) == 0 { // dw about nil bc len(nil) is 0
			continue
		}
		if _, ok := submissions[record.ID]; ok {
			continue
		}

		// convert the screenshot url to a cdn url
		screenshotURL, err := AirtableScreenshotToCDN(record.Fields.Screenshot[0].URL)
		if err != nil {
			fmt.Printf("error converting screenshot to cdn url for record %s: %v\n", record.ID, err)
			continue
		}

		submissions[record.ID] = Submission{
			GithubUsername: record.Fields.GithubUsername,
			CodeURL:        record.Fields.CodeURL,
			PlayableURL:    record.Fields.PlayableURL,
			Scoops:         record.Fields.Scoops,
			ScreenshotURL:  screenshotURL,
		}
	}

	if err := saveSubmissions(submissions); err != nil {
		fmt.Printf("error saving submissions: %v\n", err)
		return
	}
}
