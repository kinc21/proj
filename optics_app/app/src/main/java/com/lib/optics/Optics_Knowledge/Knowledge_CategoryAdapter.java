package com.lib.optics.Optics_Knowledge;

import android.content.Context;
import android.support.v4.app.Fragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentPagerAdapter;

import com.lib.optics.R;


/**
 * Created by lenovo on 18-12-2017.
 */

public class Knowledge_CategoryAdapter extends FragmentPagerAdapter {

    /** Context of the app */
    private Context mContext;
    /**
     * Create a new {@link Knowledge_CategoryAdapter} object.
     *
     * @param fm is the fragment manager that will keep each fragment's state in the adapter
     *           across swipes.
     */
    public Knowledge_CategoryAdapter(Context context, FragmentManager fm) {
        super(fm);
        mContext = context;
    }

    /**
     * Return the {@link Fragment} that should be displayed for the given page number.
     */
    @Override
    public Fragment getItem(int position) {
        if (position == 0) {
            return new Knowledge_LightFragment();
        } else if (position == 1) {
            return new Knowledge_PropertiesFragment();
        } else if (position == 2) {
            return new Knowledge_ReflectionFragment();
        } else if (position == 3){
            return new Knowledge_RadiationFragment();
        } else {
            return new Knowledge_EmissionFragment();
        }
    }

    /**
     * Return the total number of pages.
     */
    @Override
    public int getCount() {
        return 5;
    }

    @Override
    public CharSequence getPageTitle(int position) {
        if (position == 0) {
            return mContext.getString(R.string.light);
        } else if (position == 1) {
            return mContext.getString(R.string.properties);
        } else if (position == 2) {
            return mContext.getString(R.string.reflection);
        } else if (position == 3) {
            return mContext.getString(R.string.radiation);
        } else {
            return mContext.getString(R.string.emission);
        }
    }

}
