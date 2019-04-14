package com.lib.optics.Exercise_1;

import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;

import com.lib.optics.R;


/**
 * Created by lenovo on 18-12-2017.
 */

public class Ex1_CategoryAdapter extends FragmentPagerAdapter {

    /** Context of the app */
    private Context mContext;
    /**
     * Create a new {@link Ex1_CategoryAdapter} object.
     *
     * @param fm is the fragment manager that will keep each fragment's state in the adapter
     *           across swipes.
     */
    public Ex1_CategoryAdapter(Context context, FragmentManager fm) {
        super(fm);
        mContext = context;
    }

    /**
     * Return the {@link Fragment} that should be displayed for the given page number.
     */
    @Override
    public Fragment getItem(int position) {
        if (position == 0) {
            return new Ex1_1_Fragment();
        } else if (position == 1) {
            return new Ex1_2_Fragment();
        } else if (position == 2) {
            return new Ex1_3_Fragment();
        } else {
            return new Ex1_4_Fragment();
        }
    }

    /**
     * Return the total number of pages.
     */
    @Override
    public int getCount() {
        return 4;
    }

    @Override
    public CharSequence getPageTitle(int position) {
        if (position == 0) {
            return mContext.getString(R.string.ex1);
        } else if (position == 1) {
            return mContext.getString(R.string.ex2);
        } else if (position == 2) {
            return mContext.getString(R.string.ex3);
        } else {
            return mContext.getString(R.string.ex4);
        }
    }

}
