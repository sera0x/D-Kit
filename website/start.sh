#!/bin/bash
cd /home/MJ/d-kit/website
npm run build
npm run preview -- --host 0.0.0.0
