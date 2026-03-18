#!/bin/bash
# PayFlow Lab - Environment Setup Script
# Run this script to verify all required tools are installed

echo "============================================"
echo "     PayFlow Lab - Environment check"
echo "============================================"

check_tool(){
    if command -v $1 &> /dev/null; then
        echo "$1 - $(${1} --version 2>&1 | head -n1)"
    else
        echo "$1 - NOT FOUND"
    fi
}

check_tool docker
check_tool terraform
check_tool aws
check_tool node
check_tool npm
check_tool git
check_tool code

echo ""
echo "==================================="
echo "    AWS Connection Check"
echo "==================================="
aws sts get-caller-identity 2>/dev/null && echo "AWS CLI Connected" || echo "AWS CLI NOT configured"


echo ""
echo "Environment check complete."