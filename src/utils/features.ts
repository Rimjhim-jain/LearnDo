import axios from "axios";
import {generate} from "random-words";
import _ from 'lodash';

const generateMCQ = (meaning:{
    Text: string;
}[],idx:number) : string[] => {

    const correctAns:string = meaning[idx].Text;

    const allMeaningExceptForCorrect = meaning.filter((i) => i.Text !== correctAns);

    const incorrectOptions:string[] = _.sampleSize(allMeaningExceptForCorrect,3).map((i) => i.Text);

    const mcqOptions = _.shuffle([...incorrectOptions,correctAns]);

    return mcqOptions;
};



export const translateWords = async(params: LangType):Promise<WordType[]> => {
    try{
            
    const randomWordArray: string | string[] = generate(8);

    // Ensure randomWordArray is an array, even if it's a single string
    const words: { Text: string; }[] = Array.isArray(randomWordArray)
    ? randomWordArray.map(word => ({ Text: word }))
    : [{ Text: randomWordArray }]; 


       const translateApi = import.meta.env.VITE_TRANSLATE_API;

            
       const response = await axios.post('https://microsoft-translator-text.p.rapidapi.com/translate',
           words,
           {
            params: {
                'to[0]': params,
                'api-version': '3.0',
                profanityAction: 'NoAction',
                textType: 'plain'
            },
            headers: {
                'content-type': 'application/json',
                'X-RapidAPI-Key': translateApi,
                'X-RapidAPI-Host': 'microsoft-translator-text.p.rapidapi.com'
            },
        });

    
        const receive: FetchedDataType[] = response.data;

        const arr:WordType[] = receive.map((i,idx) => {
            
            const options:string[] = generateMCQ(words,idx);

            return {
                word: i.translations[0].text,
                meaning:words[idx].Text,
                options,
            }
        })

        return arr;
    }catch(error){
        console.log(error);
        throw new Error("Kuch gadbad hai daya");
    }
};

export const countMatchingElements = (arr1: string[],arr2:string[]):number=> {
   
    if(arr1.length !== arr2.length)
        throw new Error("Arrays are not equal");

    let matchedCount = 0;

    for(let i = 0; i < arr1.length; i++){
        if(arr1[i] === arr2[i]){
            matchedCount++;
        }
    }

    return matchedCount;
};

export const fetchAudio = async (text:string,language:LangType):Promise<string> => {

    const key = import.meta.env.VITE_TEXT_TO_SPEECH_API;
    const rapidKey = import.meta.env.VITE_RAPID_API;

    const encodedParams = new URLSearchParams({
        src:text,
        r:"0",
        c:"mp3",
        f: '8khz_8bit_mono',
        b64:"true",
    });

    if(language === "ja") encodedParams.set("h1","ja-jp")
    else if(language === "es") encodedParams.set("h1","es-es")
    else if(language === "fr") encodedParams.set("h1","fr-fr")
    else encodedParams.set("h1","hi-in")
    
    const {data}:{data:string} = await axios.post("https://voicerss-text-to-speech.p.rapidapi.com/",
    encodedParams,{
        params: {key},
        headers: {
            'content-type': 'application/x-www-form-urlencoded',
            'X-RapidAPI-Key': rapidKey,
            'X-RapidAPI-Host': 'voicerss-text-to-speech.p.rapidapi.com'
        },
    }
    )

    return data;
}