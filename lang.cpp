#include <iostream>
#include <vector>
#include <regex>
#include <boost/any.hpp>
#include <typeinfo>

using namespace std;
class integer{
    public:
        int value;
        string base = "int";
        string type = "int";
        integer(string val){
            value = stoi(val);
        }
        
};
class float_{
    public:
        int value;
        string base = "int";
        string type = "int";
        float_(string val){
            value = stof(val);
        }
        
};
auto checkType(string val){
    regex forint("\\d*");
    regex forfloat("\\d*\\.\\d+");
    if(regex_match(val,forint)){
        return integer(val);
    }else if(regex_match(val,forfloat)){
        return float_(val);
    }
};

int main(){
    
    cout << checkType("12345").getValue() << endl;
}