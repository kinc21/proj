package com.lib.optics.Animation;

import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;

import com.lib.optics.R;

/**
 * Created by lenovo on 18-12-2017.
 */

public class Animation_CategoryAdapter extends FragmentPagerAdapter {

    /** Context of the app */
    private Context mContext;

    /**
     * Create a new {@link Animation_CategoryAdapter} object.
     *
     * @param fm is the fragment manager that will keep each fragment's state in the adapter
     *           across swipes.
     */
    public Animation_CategoryAdapter(Context context, FragmentManager fm) {
        super(fm);
        mContext = context;
    }

    /**
     * Return the {@link Fragment} that should be displayed for the given page number.
     */
    @Override
    public Fragment getItem(int position) {
        if (position == 0) {
            return new Animation_EyeFragment();
        } else if (position == 1) {
            return new Animation_InterferenceFragment();
        } else if (position == 2) {
            return new Animation_ReflectionFragment();
        } else if (position == 3){
            return new Animation_RefractionFragment();
        } else if (position == 4){
            return new Animation_HuyFragment();
        } else if (position == 5){
            return new Animation_PrismFragment();
        } else if (position == 6){
            return new Animation_ConcaveFragment();
        } else {
            return new Animation_ConvexFragment();
        }
    }

    /**
     * Return the total number of pages.
     */
    @Override
    public int getCount() {
        return 8;
    }

    @Override
    public CharSequence getPageTitle(int position) {
        if (position == 0) {
            return mContext.getString(R.string.eyeball);
        } else if (position == 1) {
            return mContext.getString(R.string.interference);
        } else if (position == 2) {
            return mContext.getString(R.string.reflection);
        } else if (position == 3) {
            return mContext.getString(R.string.refraction);
        }else if (position == 4) {
            return mContext.getString(R.string.huygens);
        }else if (position == 5) {
            return mContext.getString(R.string.prism);
        }else if (position == 6) {
            return mContext.getString(R.string.concave);
        }else {
            return mContext.getString(R.string.convex);
        }
    }
}
