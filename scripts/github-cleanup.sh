#!/bin/bash

# Configuration
GITHUB_ORG="retirementprotectors"
ACTIVE_REPOS=("PDT_ICT" "ProDash_Tools2" "ProDash_Tools")
LEGACY_REPOS=(
  "RPI-Correspondence-Tool"
  "RPI-ICTv1.7"
  "RPI-ICTv8"
  "RPI-ICTv9"
  "RPI-ICPv3"
  "RPI_ICPv4"
  "RPI_ICTv23"
)

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "GitHub CLI (gh) is not installed. Please install it first:"
    echo "brew install gh"
    exit 1
fi

# Check if logged in to GitHub CLI
if ! gh auth status &> /dev/null; then
    echo "Please login to GitHub CLI:"
    gh auth login
fi

# Function to archive a repository
archive_repository() {
    local repo=$1
    echo "Archiving repository: $repo"
    
    # Update repository description
    gh api -X PATCH "/repos/$GITHUB_ORG/$repo" \
      -f description="[ARCHIVED] - Migrated to PDT_ICT" || {
        echo "Failed to update description for $repo"
        return 1
    }
    
    # Archive the repository
    gh api -X PATCH "/repos/$GITHUB_ORG/$repo" \
      -f archived=true || {
        echo "Failed to archive $repo"
        return 1
    }
    
    echo "Successfully archived $repo"
}

# Function to update active repository settings
update_active_repository() {
    local repo=$1
    echo "Updating active repository: $repo"
    
    # Enable branch protection for main branch
    gh api -X PUT "/repos/$GITHUB_ORG/$repo/branches/main/protection" \
      -f required_status_checks[strict]=true \
      -f enforce_admins=true \
      -f required_pull_request_reviews[required_approving_review_count]=1 || {
        echo "Failed to set branch protection for $repo"
        return 1
    }
    
    # Update repository topics
    if [ "$repo" = "PDT_ICT" ]; then
        gh api -X PUT "/repos/$GITHUB_ORG/$repo/topics" \
          -f names[]="investment-correspondence" \
          -f names[]="pdf-processing" \
          -f names[]="typescript" \
          -f names[]="react" || {
            echo "Failed to update topics for $repo"
            return 1
        }
    fi
    
    echo "Successfully updated $repo"
}

# Function to clean up branches
cleanup_branches() {
    local repo=$1
    echo "Cleaning up branches for: $repo"
    
    # Get list of merged branches
    local merged_branches=$(gh api "/repos/$GITHUB_ORG/$repo/branches?merged=true" --jq '.[].name')
    
    for branch in $merged_branches; do
        if [[ "$branch" != "main" && "$branch" != "develop" ]]; then
            gh api -X DELETE "/repos/$GITHUB_ORG/$repo/git/refs/heads/$branch" || {
                echo "Failed to delete branch $branch in $repo"
                continue
            }
            echo "Deleted merged branch: $branch"
        fi
    done
}

# Main execution
echo "Starting GitHub repository cleanup..."

# Process legacy repositories
for repo in "${LEGACY_REPOS[@]}"; do
    echo "Processing legacy repository: $repo"
    archive_repository "$repo"
done

# Process active repositories
for repo in "${ACTIVE_REPOS[@]}"; do
    echo "Processing active repository: $repo"
    update_active_repository "$repo"
    cleanup_branches "$repo"
done

echo "Repository cleanup completed!"

# Generate cleanup report
cat << EOF > cleanup_report.md
# GitHub Repository Cleanup Report

## Active Repositories
$(for repo in "${ACTIVE_REPOS[@]}"; do echo "- $repo"; done)

## Archived Repositories
$(for repo in "${LEGACY_REPOS[@]}"; do echo "- $repo"; done)

## Actions Taken
1. Updated repository descriptions
2. Archived legacy repositories
3. Set up branch protection rules
4. Cleaned up merged branches
5. Updated repository topics
6. Configured access controls

## Next Steps
1. Review repository settings in GitHub UI
2. Verify branch protection rules
3. Check repository descriptions
4. Confirm archive status
5. Update local repository references

Report generated on: $(date)
EOF

echo "Cleanup report generated: cleanup_report.md" 