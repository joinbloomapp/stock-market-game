## Notes

- Side note: why not combine AWS task definitions since all 4
  files use the same environment variables? In the scenario
  that they don't have the same ARNs, or you want separate configurations
  for each, then thank me :) It's a hassle, but for customization and explicit
  purposes, it's better to have this duplication of code
