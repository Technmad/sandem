#!/bin/bash

# Fix README.md - remove closing backticks
sed -i '$ s/```$//' README.md

# Fix 00_Getting_Started.md - remove opening backticks and duplicate content  
sed -i '1s/^````markdown$//' 00_Getting_Started.md
sed -i '/^## Key Principles/,/^---$/ {
  /^## Comparison to StackBlitz/,/^[[:space:]]*$/ {
    /^````$/d
  }
}' 00_Getting_Started.md

# Remove the duplicate section in 00_Getting_Started
sed -i '/^That'"'"'s it! Projects/,/^## Architecture Overview/ {
  /^## Architecture Overview/,/^```$/ d
}' 00_Getting_Started.md

# Fix 04_Implementation_Guide.md - remove duplicate troubleshooting
sed -i '/^### Folders exist but Explorer tree does not update$/,/^---$/ {
  N
  /^### Folders exist but Explorer tree does not update\n\n---\n\n\*\*\[\|<<<.*Previous\|.*Code Examples/! {
    /^### Folders exist but Explorer tree does not update$/,/^---$/ {
      /^### Folders exist but Explorer tree does not update$/!  {
        /^---$/! d
      }
    }
  }
}' 04_Implementation_Guide.md

# Fix 05_Code_Examples.md
sed -i '1s/^````markdown$//' 05_Code_Examples.md
sed -i '$ s/````$//' 05_Code_Examples.md

# Fix 06_Diagrams_and_Flows.md - complete error flow and remove trailing backticks
sed -i '/^## Error Flow$/,/^```$/ {
  /^explorerActions.createFolderAtRoot()/a\    |\n    ├─ Success: Show new folder ✓\n    |\n    └─ Error: Display error message\n        |\n        ├─ "Network error" → Show retry button\n        ├─ "Invalid name" → Show validation message\n        └─ "Unknown error" → Show error with details
  s/^\`\`\`\`$/```/
}' 06_Diagrams_and_Flows.md

# Fix 08_What_Was_Built.md
sed -i '1s/^````markdown$//' 08_What_Was_Built.md
sed -i '/^**Export Conflict Resolution/,/^$/ {
  s/Consolidated duplicate.*/Consolidated duplicate `ExplorerActionContext` definitions to prevent conflicts and improve module clarity./
}' 08_What_Was_Built.md
sed -i '/^**Export Conflict Resolution/a\\' 08_What_Was_Built.md

echo "Documentation files fixed!"
