package com.lib.optics.Exercise_1;


import android.os.Bundle;
import android.support.v4.app.Fragment;
import android.support.v4.content.ContextCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.CheckBox;
import android.widget.ListView;

import com.lib.optics.R;
import com.lib.optics.Word;
import com.lib.optics.WordAdapter;

import java.util.ArrayList;

/**
 * A simple {@link Fragment} subclass.
 */
public class Ex1_4_Fragment extends Fragment {
    
    //private MediaPlayer mMediaPlayer;

    //Handles Audio Focus while playing a sound file
    //private AudioManager mAudioManager;

/*
    //For checking whether the audio is done playing or not
    private MediaPlayer.OnCompletionListener mCompletionListener = new MediaPlayer.OnCompletionListener() {
        @Override
        public void onCompletion(MediaPlayer mp) {
            releaseMediaPlayer();
        }
    };
*/

    public Ex1_4_Fragment() {
        // Required empty public constructor
    }


    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container,
                             Bundle savedInstanceState) {

        View rootView = inflater.inflate(R.layout.words_list, container,false);

        //Create and set uo {@link AudioManager} to request Audio Focus
        //mAudioManager = (AudioManager) getActivity().getSystemService(Context.AUDIO_SERVICE);

        //Creating an ArrayList of words
        final ArrayList<Word> words = new ArrayList<Word>();

        words.add(new Word(R.string.marathi_number_one_script,R.string.q1_4_1,
                R.string.english_number_one,R.drawable.number_one,R.raw.marathi_numbers_one));
        words.add(new Word(R.string.marathi_number_two_script,R.string.q1_4_2,
                R.string.english_number_two,R.drawable.number_two,R.raw.marathi_numbers_two));
        words.add(new Word(R.string.marathi_number_three_script,R.string.q1_4_3,
                R.string.english_number_three,R.drawable.number_three,R.raw.marathi_numbers_three));
        words.add(new Word(R.string.marathi_number_four_script,R.string.q1_4_4,
                R.string.english_number_four,R.drawable.number_four,R.raw.marathi_numbers_four));
        words.add(new Word(R.string.marathi_number_five_script,R.string.q1_4_5,
                R.string.english_number_five,R.drawable.number_five,R.raw.marathi_numbers_five));
        words.add(new Word(R.string.marathi_number_six_script,R.string.q1_4_6,
                R.string.english_number_six,R.drawable.number_six,R.raw.marathi_numbers_six));
        words.add(new Word(R.string.marathi_number_seven_script,R.string.q1_4_7,
                R.string.english_number_seven,R.drawable.number_seven,R.raw.marathi_numbers_seven));
        words.add(new Word(R.string.marathi_number_eight_script,R.string.q1_4_8,
                R.string.english_number_eight,R.drawable.number_eight,R.raw.marathi_numbers_eight));
        words.add(new Word(R.string.marathi_number_nine_script,R.string.q1_4_9,
                R.string.english_number_nine,R.drawable.number_nine,R.raw.marathi_numbers_nine));
        words.add(new Word(R.string.marathi_number_two_script,R.string.q1_4_10,
                R.string.english_number_ten,R.drawable.number_ten,R.raw.marathi_numbers_ten));
        final ArrayList<String> ans = new ArrayList<String>();
        ans.add("no");
        ans.add("no");
        ans.add("yes");
        ans.add("no");
        ans.add("yes");
        ans.add("no");
        ans.add("no");
        ans.add("no");
        ans.add("no");
        ans.add("no");
        WordAdapter adapter = new WordAdapter(getActivity(),words,R.color.black);
        System.out.println("aaa");
        ListView listView = (ListView)rootView.findViewById(R.id.list);

        listView.setAdapter(adapter);
        System.out.println("bb");
        listView.setItemsCanFocus(true);

        listView.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, int position, long id) {
                System.out.println("aaa");

                System.out.println(position);
                //Get the {@link Word} object at the given position user clicked on
                Word word = words.get(position);
                String ans_str = ans.get(position);

                CheckBox Yes = (CheckBox) view.findViewById(position);
                CheckBox No = (CheckBox) view.findViewById(1000+position);
                System.out.println(ans_str);
                System.out.println(Yes.isChecked());
                if(Yes.isChecked()&&!No.isChecked()){
                    No.setChecked(false);
                    Yes.setEnabled(false);
                    No.setEnabled(false);
                    if("yes".equals(ans_str)){
                        view.findViewById(R.id.text_container).setBackgroundColor(ContextCompat.getColor(getContext(), R.color.g));
                    }else {
                        view.findViewById(R.id.text_container).setBackgroundColor(ContextCompat.getColor(getContext(), R.color.r));
                    }

                }else if(No.isChecked()&&!Yes.isChecked()){
                    Yes.setChecked(false);
                    Yes.setEnabled(false);
                    No.setEnabled(false);

                    System.out.println("a22a");
                    if("no".equals(ans_str)){
                        view.findViewById(R.id.text_container).setBackgroundColor(ContextCompat.getColor(getContext(), R.color.g));
                    }else {
                        view.findViewById(R.id.text_container).setBackgroundColor(ContextCompat.getColor(getContext(), R.color.r));
                    }
                }else if((No.isChecked()&&Yes.isChecked())||(!No.isChecked()&&!Yes.isChecked())){
                    Yes.setChecked(false);
                    No.setChecked(false);
                    view.findViewById(R.id.text_container).setBackgroundColor(ContextCompat.getColor(getContext(), R.color.black));
                }



            }
        });

        return rootView;
    }
}


