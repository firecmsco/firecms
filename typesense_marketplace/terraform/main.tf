# Terraform Configuration for FireCMS Typesense Search
# 
# This sets up the GCP infrastructure required for the Marketplace solution

terraform {
  required_version = ">= 1.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region for Cloud Functions"
  type        = string
  default     = "us-central1"
}

variable "zone" {
  description = "GCP Zone for Compute Engine"
  type        = string
  default     = "us-central1-a"
}

variable "marketplace_pubsub_topic" {
  description = "Pub/Sub topic for Marketplace events (provided by Google)"
  type        = string
  default     = "cloud-commerce-procurement"
}

# Enable required APIs
resource "google_project_service" "compute" {
  project = var.project_id
  service = "compute.googleapis.com"
}

resource "google_project_service" "cloudfunctions" {
  project = var.project_id
  service = "cloudfunctions.googleapis.com"
}

resource "google_project_service" "secretmanager" {
  project = var.project_id
  service = "secretmanager.googleapis.com"
}

resource "google_project_service" "firestore" {
  project = var.project_id
  service = "firestore.googleapis.com"
}

resource "google_project_service" "pubsub" {
  project = var.project_id
  service = "pubsub.googleapis.com"
}

resource "google_project_service" "run" {
  project = var.project_id
  service = "run.googleapis.com"
}

resource "google_project_service" "cloudbuild" {
  project = var.project_id
  service = "cloudbuild.googleapis.com"
}

# Service Account for Cloud Functions
resource "google_service_account" "functions_sa" {
  project      = var.project_id
  account_id   = "typesense-marketplace-fn"
  display_name = "Typesense Marketplace Cloud Functions"
}

# IAM roles for the service account
resource "google_project_iam_member" "functions_compute_admin" {
  project = var.project_id
  role    = "roles/compute.admin"
  member  = "serviceAccount:${google_service_account.functions_sa.email}"
}

resource "google_project_iam_member" "functions_secretmanager" {
  project = var.project_id
  role    = "roles/secretmanager.admin"
  member  = "serviceAccount:${google_service_account.functions_sa.email}"
}

resource "google_project_iam_member" "functions_firestore" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.functions_sa.email}"
}

resource "google_project_iam_member" "functions_pubsub" {
  project = var.project_id
  role    = "roles/pubsub.subscriber"
  member  = "serviceAccount:${google_service_account.functions_sa.email}"
}

# Pub/Sub subscription for Marketplace events
resource "google_pubsub_subscription" "marketplace_events" {
  name    = "typesense-marketplace-events"
  project = var.project_id
  topic   = var.marketplace_pubsub_topic

  push_config {
    push_endpoint = "https://${var.region}-${var.project_id}.cloudfunctions.net/handleMarketplaceEvent"

    oidc_token {
      service_account_email = google_service_account.functions_sa.email
    }
  }

  ack_deadline_seconds = 60

  retry_policy {
    minimum_backoff = "10s"
    maximum_backoff = "600s"
  }

  expiration_policy {
    ttl = "" # Never expire
  }
}

# Cloud Storage bucket for function source code
resource "google_storage_bucket" "functions_source" {
  name                        = "${var.project_id}-typesense-marketplace-source"
  project                     = var.project_id
  location                    = var.region
  uniform_bucket_level_access = true
}

# Output values
output "service_account_email" {
  value       = google_service_account.functions_sa.email
  description = "Service account email for Cloud Functions"
}

output "pubsub_subscription" {
  value       = google_pubsub_subscription.marketplace_events.name
  description = "Pub/Sub subscription for Marketplace events"
}

output "functions_bucket" {
  value       = google_storage_bucket.functions_source.name
  description = "Cloud Storage bucket for function source"
}
